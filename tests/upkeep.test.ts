import {
  Anarchy,
  Despotism,
  Fundamentalism,
} from '@civ-clone/civ2-government/Governments';
import { AdamSmithsTradingCompany } from '../Wonders';
import { Barracks, Granary, Palace, Temple } from '../CityImprovements';
import { Gunpowder, MobileWarfare } from '@civ-clone/civ2-science/Advances';
import { atLevel, built, cityOf, governedBy, registries } from './lib/stubs';
import { paysUpkeep, upkeep } from '../lib/upkeep';
import { expect } from 'chai';

describe('lib/upkeep', (): void => {
  const of = (
    Improvement: any,
    {
      level = 3,
      Government = Despotism,
      known = [] as Function[],
      wonders = [] as any[],
    } = {}
  ) =>
    upkeep(Improvement, 'p' as any, {
      ...registries(known, wonders),
      gameDifficultyRegistry: atLevel(level),
      playerGovernmentRegistry: governedBy(Government),
    });

  it("charges @IMPROVE's upkeep", (): void => {
    expect(of(Temple)).equal(1);
    expect(of(Palace)).equal(0);
  });

  it('charges Barracks 1 less below Prince, 1 more with Gunpowder and 1 more with Mobile Warfare', (): void => {
    expect(of(Barracks, { level: 1 })).equal(0);
    expect(of(Barracks, { level: 2 })).equal(1);
    expect(of(Barracks, { known: [Gunpowder] })).equal(2);
    expect(of(Barracks, { known: [Gunpowder, MobileWarfare] })).equal(3);
    expect(of(Barracks, { level: 0, known: [Gunpowder] })).equal(1);
  });

  it("charges nothing for an upkeep of 1 with Adam Smith's", (): void => {
    const wonders = [built(AdamSmithsTradingCompany, cityOf('p'))];

    expect(of(Granary, { wonders })).equal(0);
    expect(of(Barracks, { wonders, known: [Gunpowder] })).equal(2);
  });

  it('keeps a Temple for nothing under Fundamentalism', (): void => {
    expect(of(Temple, { Government: Fundamentalism })).equal(0);
    expect(of(Granary, { Government: Fundamentalism })).equal(1);
  });

  it('is paid at all only outside Anarchy', (): void => {
    expect(paysUpkeep('p' as any, governedBy(Anarchy))).false;
    expect(paysUpkeep('p' as any, governedBy(Despotism))).true;
  });
});
