import {
  Aqueduct,
  Barracks,
  CityWalls,
  Courthouse,
  Granary,
  Library,
  Palace,
  Temple,
} from '../CityImprovements';
import { atLevel, built, cityOf, playedBy, registries } from './lib/stubs';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Gold } from '../Yields';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import captured from '../Rules/City/captured';
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import Engine from '@civ-clone/core-engine/Engine';
import improvementCreated from '../Rules/CityImprovement/created';
import { expect } from 'chai';
import { palaceEscape } from '../lib/capital';

const tile = (x: number) => ({
  x,
  distanceFrom: (other: any) => Math.abs(x - other.x),
});

const world = ({
  level = 4,
  gold = 1500,
  cities = 12,
  human = false,
  capturedSize = 10,
}: {
  level?: number;
  gold?: number;
  cities?: number;
  human?: boolean;
  capturedSize?: number;
} = {}) => {
  const r = registries(),
    sizes = new Map<City, number>(),
    captive = cityOf('loser', { tile: () => tile(0) }),
    others: City[] = [],
    treasury = {
      value: () => gold,
      yield: () => Gold,
      subtract: (n: number) => (gold -= n),
    };

  sizes.set(captive, capturedSize);

  for (let i = 1; i <= cities; i++) {
    const city = cityOf('loser', { tile: () => tile(i) });

    sizes.set(
      city,
      i === 3 ? 12 : i === 5 ? 9 : i === 1 ? 7 : i === 10 ? 8 : 4
    );
    others.push(city);
  }

  const dependencies = {
    ...r,
    cityGrowthRegistry: {
      getByCity: (city: City) => ({ size: () => sizes.get(city) }),
    } as any,
    cityRegistry: { getByPlayer: () => [captive, ...others] } as any,
    clientRegistry: playedBy(...(human ? ['loser'] : [])),
    gameDifficultyRegistry: atLevel(level),
    playerTreasuryRegistry: { getByPlayer: () => [treasury] } as any,
    unitRegistry: { getByTile: () => [] } as any,
  };

  return { captive, dependencies, gold: () => gold, others, r };
};

describe('lib/capital: palaceEscape', (): void => {
  it("moves a computer player's Palace to its best city of size 8 or more and half the captured city's", (): void => {
    const { captive, dependencies, others } = world();

    // City 3 (size 12, 3 away) scores 33, city 5 (size 9, 5 away) 22.
    expect(palaceEscape(captive, 'loser' as any, dependencies)).equal(
      others[2]
    );
  });

  it("walls double a city's score", (): void => {
    const { captive, dependencies, others, r } = world();

    r.cityImprovementRegistry.register(built(CityWalls, others[4]));
    expect(palaceEscape(captive, 'loser' as any, dependencies)).equal(
      others[4]
    );
  });

  it('only above Prince, with 1000 gold, and more than 11 cities or 2000 gold, and never for a person', (): void => {
    [
      world({ level: 2 }),
      world({ gold: 999 }),
      world({ cities: 11 }),
      world({ human: true }),
    ].forEach(
      ({ captive, dependencies }) =>
        expect(palaceEscape(captive, 'loser' as any, dependencies)).null
    );

    const rich = world({ cities: 11, gold: 2000 });

    expect(palaceEscape(rich.captive, 'loser' as any, rich.dependencies)).not
      .null;
  });
});

describe('city:captured, the Palace escape', (): void => {
  it("pays 1000 gold and builds the computer player's Palace in its best city, and the captured city loses its own", (): void => {
    const { captive, dependencies, gold, others, r } = world(),
      ruleRegistry = new RuleRegistry(),
      palace = built(Palace, captive);

    r.cityImprovementRegistry.register(palace);
    ruleRegistry.register(
      ...improvementCreated(r.cityImprovementRegistry, new Engine()),
      ...captured({ ...dependencies, ruleRegistry }, () => 0.9)
    );
    ruleRegistry.process(
      Captured,
      captive,
      'taker' as any,
      'loser' as any,
      null
    );

    expect(palace.destroyed()).true;
    expect(
      r.cityImprovementRegistry.getByType(Palace).map((p) => p.city())
    ).eql([others[2]]);
    expect(gold()).equal(500);
  });
});

describe('city:captured', (): void => {
  const capture = (founder: unknown, roll: number, cause: unknown = null) => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('taker', { originalPlayer: () => founder }),
      improvements = [
        Palace,
        Barracks,
        Granary,
        Temple,
        Courthouse,
        Aqueduct,
        Library,
      ].map((Type) => built(Type as typeof CityImprovement, city));

    r.cityImprovementRegistry.register(...improvements);
    ruleRegistry.register(
      ...captured(
        {
          ...r,
          cityRegistry: { getByPlayer: () => [] } as any,
          clientRegistry: playedBy(),
          gameDifficultyRegistry: atLevel(0),
        },
        () => roll
      )
    );
    ruleRegistry.process(Captured, city, 'taker' as any, 'loser' as any, cause);

    return r.cityImprovementRegistry
      .getByCity(city)
      .map((improvement) => improvement.constructor.name);
  };

  it('loses the Palace, Temple and Courthouse, then every improvement in an even @IMPROVE row, or every odd one', (): void => {
    // Rows: Barracks 2, Granary 3, Aqueduct 9, Library 6.
    expect(capture('someone', 0.1)).eql(['Granary', 'Aqueduct']);
    expect(capture('someone', 0.9)).eql(['Barracks', 'Library']);
  });

  it('incited, it loses the Palace, Temple and Courthouse, but nothing to the roll', (): void => {
    expect(capture('someone', 0.1, Object.create(InciteRevolt.prototype))).eql([
      'Barracks',
      'Granary',
      'Aqueduct',
      'Library',
    ]);
  });

  it('retaken by its founder, it loses only the Palace', (): void => {
    expect(capture('taker', 0.1)).eql([
      'Barracks',
      'Granary',
      'Temple',
      'Courthouse',
      'Aqueduct',
      'Library',
    ]);
  });
});
