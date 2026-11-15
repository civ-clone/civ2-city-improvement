import {
  Automobile,
  Environmentalism,
  Industrialization,
  Sanitation,
} from '@civ-clone/civ2-science/Advances';
import {
  Factory,
  MassTransit,
  RecyclingCenter,
  SolarPlant,
} from '../CityImprovements';
import { Production, UnitSupportProduction } from '../Yields';
import { built, cityOf, registries } from './lib/stubs';
import { pollution, populationFactor, rollRange } from '../lib/pollution';
import { HooverDam } from '../Wonders';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { Waste } from '@civ-clone/civ2-city/Yields';
import { expect } from 'chai';
import pollutionDivisor from '../Rules/City/pollution-divisor';

describe('lib/pollution', (): void => {
  const setUp = (known: Function[] = []) => {
    const r = registries(known),
      ruleRegistry = new RuleRegistry(),
      city = cityOf(),
      cityGrowthRegistry = { getByCity: () => ({ size: () => 8 }) } as any;

    ruleRegistry.register(...pollutionDivisor(r));

    return {
      city,
      r,
      of: (shields: number) =>
        pollution(
          city,
          [new Production(shields), new UnitSupportProduction(3)],
          r,
          ruleRegistry,
          cityGrowthRegistry
        ),
    };
  };

  it('is shields (before unit support) − 20, divided by the best of the plants and the Recycling Center', (): void => {
    const plain = setUp();

    // Unit support (3) is ignored: the shields are counted before it.
    expect(plain.of(30)).equal(30 - 20);
    // So is civ2-city's waste, which `city_calc_shields_pollution` takes off after the pollution (~3435–3441).
    expect(
      pollution(
        plain.city,
        [new Production(30), new Waste(4)],
        plain.r,
        new RuleRegistry(),
        { getByCity: () => ({ size: () => 8 }) } as any
      )
    ).equal(30 - 20);

    const recycling = setUp();

    recycling.r.cityImprovementRegistry.register(
      built(RecyclingCenter, recycling.city)
    );
    expect(recycling.of(65)).equal(21 - 20);

    const hoover = setUp();

    hoover.r.wonders.push(built(HooverDam, cityOf()));
    expect(hoover.of(43)).equal(21 - 20);
  });

  it('adds size × steps ÷ 4: a step an advance, one more without Sanitation, one less with Environmentalism or a Solar Plant', (): void => {
    const two = setUp([Industrialization, Automobile]);

    // 2 advances + no Sanitation = 3 steps: 8 × 3 ÷ 4 = 6.
    expect(populationFactor(two.city, two.r)).equal(3);
    expect(two.of(23)).equal(3 + 6);

    two.r.known.push(Sanitation, Environmentalism);
    expect(populationFactor(two.city, two.r)).equal(1);

    two.r.cityImprovementRegistry.register(built(MassTransit, two.city));
    expect(populationFactor(two.city, two.r)).equal(0);
  });

  it('takes nothing from shields with a Solar Plant, and nothing off either', (): void => {
    const solar = setUp([Industrialization]);

    solar.r.cityImprovementRegistry.register(
      built(SolarPlant, solar.city),
      built(Factory, solar.city)
    );
    // 1 advance + no Sanitation - Solar = 1 step: 8 × 1 ÷ 4.
    expect(solar.of(200)).equal(2);
  });

  it('rolls out of 256 less half the advances (from 1) times the level, halved above 255 with a Solar Plant', (): void => {
    const { city, r } = setUp([Industrialization, Automobile, Sanitation]);

    // 4 advances × 5 ÷ 2 = 10.
    expect(rollRange(() => 5, r)(city)).equal(246);

    r.known.push(...new Array(199).fill(Automobile));
    // 203 × 5 ÷ 2 = 507.
    expect(rollRange(() => 5, r)(city)).equal(256 - 507);
    r.cityImprovementRegistry.register(built(SolarPlant, city));
    expect(rollRange(() => 5, r)(city)).equal(256 - 253);
  });
});
