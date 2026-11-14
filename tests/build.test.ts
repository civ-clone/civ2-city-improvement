import * as I from '../CityImprovements';
import { HooverDam, Pyramids, SetiProgram } from '../Wonders';
import { Mountains, Ocean } from '@civ-clone/civ2-world/Terrains';
import { built, cityOf, registries } from './lib/stubs';
import { hasOceanAccess, isCoastal, isHydroSite } from '../lib/site';
import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { River } from '@civ-clone/civ2-world/TerrainFeatures';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import build from '../Rules/City/build';
import { Electricity } from '@civ-clone/civ2-science/Advances';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { hasEither } from '../lib/source';
import { expect } from 'chai';
import improvements from '../data/improvements';

const square = (terrain: unknown, neighbours: unknown[] = []) => ({
  terrain: () => terrain,
  isWater: () => terrain instanceof Ocean,
  getNeighbours: () => neighbours,
});

describe('lib/site', (): void => {
  const land = {},
    lake = square(new Ocean(), [square(land)]),
    sea = square(new Ocean(), [square(new Ocean())]),
    at = (neighbours: unknown[]) =>
      cityOf('p', {
        tile: () => ({ ...square(land), getNeighbours: () => neighbours }),
      });

  it('is coastal with water beside it, with ocean access when that water is more than one square', (): void => {
    expect(isCoastal(at([square(land)]))).false;
    expect(isCoastal(at([lake]))).true;
    expect(hasOceanAccess(at([lake]))).false;
    expect(hasOceanAccess(at([sea]))).true;
  });

  it('is a hydro site by mountains or a river', (): void => {
    const river = {},
      features = {
        getByTerrain: (terrain: unknown) =>
          terrain === river ? [new River()] : [],
      } as any;

    expect(isHydroSite(at([square(land)]), features)).false;
    expect(isHydroSite(at([square(new Mountains())]), features)).true;
    expect(isHydroSite(at([square(river)]), features)).true;
  });
});

describe('city:build', (): void => {
  const setUp = () => {
    const r = registries(
        improvements.map(([, , , Advance]) => Advance!).filter(Boolean)
      ),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p', {
        tile: () => ({ ...square({}), getNeighbours: () => [] }),
      });

    ruleRegistry.register(
      ...build(
        r.cityImprovementRegistry,
        r.playerResearchRegistry,
        { getByTerrain: () => [] } as any,
        r
      )
    );

    const allows = (Item: unknown): boolean =>
      ruleRegistry
        .get(Build)
        .filter((rule) => rule.validate(city, Item as any))
        .every((rule) => (rule.process(city, Item as any) as any).validate());

    return { allows, city, r };
  };

  it('needs the advance, and the improvement it builds on', (): void => {
    const { allows, city, r } = setUp();

    expect(allows(I.Library)).true;
    expect(allows(I.University)).false;
    r.cityImprovementRegistry.register(built(I.Library, city));
    expect(allows(I.University)).true;
    expect(allows(I.Library)).false;
    expect(allows(I.ManufacturingPlant)).false;
    expect(allows(I.SolarPlant)).false;
    r.cityImprovementRegistry.register(built(I.Factory, city));
    expect([
      allows(I.ManufacturingPlant),
      allows(I.SolarPlant),
      allows(I.PowerPlant),
    ]).eql([true, true, true]);

    r.known.splice(0);
    expect(allows(I.Library)).false;
  });

  it("won't build a Courthouse beside the Palace, or a plant beside a better one", (): void => {
    const { allows, city, r } = setUp();

    r.cityImprovementRegistry.register(
      built(I.Palace, city),
      built(I.Factory, city),
      built(I.NuclearPlant, city)
    );
    expect(allows(I.Courthouse)).false;
    expect(allows(I.PowerPlant)).false;
    // Civ2 lets a Hydro Plant join a Nuclear Plant (if the site allows).
    r.cityImprovementRegistry.register(built(I.SolarPlant, city));
    expect(allows(I.NuclearPlant)).false;
  });

  it("won't build what a Wonder its player owns stands in for", (): void => {
    const { allows, city, r } = setUp();

    r.cityImprovementRegistry.register(built(I.Factory, city));
    expect(allows(I.Granary)).true;
    r.wonders.push(built(Pyramids, cityOf()), built(HooverDam, cityOf()));
    expect(allows(I.Granary)).false;
    expect(allows(I.PowerPlant)).false;
    expect(allows(I.SolarPlant)).true;
    r.wonders.push(built(SetiProgram, cityOf('q')));
    r.cityImprovementRegistry.register(
      built(I.Library, city),
      built(I.University, city)
    );
    expect(allows(I.ResearchLab)).true;
  });

  it('ignores an obsolete Wonder', (): void => {
    const { allows, r } = setUp();

    r.wonders.push(built(Pyramids, cityOf()));
    r.requirementRegistry.add(
      null,
      new Requirement({
        id: 'test:obsolete',
        subject: Pyramids,
        relation: 'obsoletedBy',
        targets: [Electricity],
        range: 'world',
      })
    );
    (r.playerResearchRegistry as any).some = () => true;

    expect(allows(I.Granary)).true;
    expect(hasEither(cityOf(), I.Granary, Pyramids, r)).false;
  });

  it('builds a Harbour only on the coast', (): void => {
    const { allows } = setUp();

    expect(allows(I.Harbour)).false;
    expect(allows(I.PortFacility)).false;
    expect(allows(I.HydroPlant)).false;
  });
});
