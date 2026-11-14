import {
  Bank,
  Courthouse,
  Factory,
  Harbour,
  Library,
  ManufacturingPlant,
  OffshorePlatform,
  Superhighways,
  Marketplace,
  PowerPlant,
  ResearchLab,
  StockExchange,
  University,
} from '../CityImprovements';
import {
  Corruption,
  Food,
  Gold,
  Luxuries,
  Production,
  Research,
  Trade,
} from '../Yields';
import { HooverDam, IsaacNewtonsCollege, SetiProgram } from '../Wonders';
import { built, cityOf, governedBy, registries } from './lib/stubs';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Fundamentalism } from '@civ-clone/civ2-government/Governments';
import High from '@civ-clone/core-rule/Priorities/High';
import { Ocean } from '@civ-clone/civ2-world/Terrains';
import { Road } from '@civ-clone/civ2-world/TileImprovements';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import { expect } from 'chai';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import yieldModifiers from '../Rules/City/yield-modifier';
import yieldRules from '../Rules/City/yield';

// A city's `yields()` with the rules here between stand-ins for civ2-city's (its squares, then its corruption, `High`)
//  and civ2-trade-rate's (its split, `Normal`: half the net trade to science, the rest to tax).
const setUp = (
  base: Yield[],
  corruption: number,
  Government: any = undefined
) => {
  const r = {
      ...registries(),
      tileImprovements: new Map<unknown, unknown[]>(),
    },
    ruleRegistry = new RuleRegistry(),
    tiles: unknown[] = [],
    city: City = cityOf('p', {
      _ruleRegistry: ruleRegistry,
      tilesWorked: () => ({ entries: () => tiles }),
    });

  ruleRegistry.register(
    new YieldRule('squares', new Effect((): Yield[] => base)),
    new YieldRule(
      'corruption',
      new High(),
      new Effect((): Yield => new Corruption(corruption))
    ),
    new YieldRule(
      'split',
      new Effect((city: City, yields: Yield[]): Yield[] => {
        const trade = reduceYield(yields, Trade),
          science = Math.floor(trade / 2);

        return [new Research(science), new Gold(trade - science)];
      })
    ),
    ...yieldRules({
      ...r,
      playerGovernmentRegistry: governedBy(Government),
      tileImprovementRegistry: {
        getByTile: (tile: unknown) => r.tileImprovements.get(tile) ?? [],
      } as any,
    }),
    ...yieldModifiers(r)
  );

  return {
    city,
    r,
    tiles,
    total: (Type: typeof Yield) => reduceYield(city.yields(), Type),
  };
};

describe('city:yield, the Courthouse', (): void => {
  it('halves the corruption before the trade is split, so the gold and science gain', (): void => {
    const without = setUp([new Trade(20)], 7),
      withCourthouse = setUp([new Trade(20)], 7);

    withCourthouse.r.cityImprovementRegistry.register(
      built(Courthouse, withCourthouse.city)
    );

    // 20 trade - 7 corruption = 13: 6 science, 7 gold; halved, 3 corruption: 17, 8 science, 9 gold.
    expect([
      without.total(Corruption),
      without.total(Research),
      without.total(Gold),
    ]).eql([-7, 6, 7]);
    expect([
      withCourthouse.total(Corruption),
      withCourthouse.total(Research),
      withCourthouse.total(Gold),
    ]).eql([-3, 8, 9]);
  });
});

describe('city:yield, the Courthouse and the Palace', (): void => {
  it("doesn't halve again in the Palace's city, which civ2-city has already halved", (): void => {
    const { city, r, total } = setUp([new Trade(20)], 7);

    r.cityImprovementRegistry.register(
      built(Courthouse, city),
      built(require('../CityImprovements').Palace, city)
    );

    expect(total(Corruption)).equal(-7);
  });
});

describe('city:yield, squares', (): void => {
  it('an Offshore Platform adds 1 shield for each ocean square worked', (): void => {
    const { city, r, tiles, total } = setUp([new Production(2)], 0);

    tiles.push({ terrain: () => new Ocean() }, { terrain: () => ({}) });
    r.cityImprovementRegistry.register(built(OffshorePlatform, city));
    expect(total(Production)).equal(3);
  });

  it('Superhighways add half the trade, rounded down, of each square with a road or the city', (): void => {
    const { city, r, tiles, total } = setUp([new Trade(0)], 0),
      road = new Road(),
      trade = (value: number) => ({
        terrain: () => ({}),
        yields: () => [new Trade(value)],
      });

    tiles.push(trade(3), trade(5), trade(4));
    (city as any).tile = () => tiles[2];
    r.tileImprovements.set(tiles[0], [road]);
    r.cityImprovementRegistry.register(built(Superhighways, city));
    // 3 with a road: +1; 5 without: nothing; 4 on the city's square: +2.
    expect(total(Trade)).equal(3);
  });
});

describe('city:yield-modifier', (): void => {
  it("adds half the base luxuries and tax for each of Marketplace, Bank and Stock Exchange, never of each other's", (): void => {
    const { city, r, total } = setUp([new Trade(0), new Luxuries(10)], 0);

    r.cityImprovementRegistry.register(built(Marketplace, city));
    expect(total(Luxuries)).equal(15);
    r.cityImprovementRegistry.register(
      built(Bank, city),
      built(StockExchange, city)
    );
    expect(total(Luxuries)).equal(25);
  });

  it("adds half the base science for each of Library, University and Research Lab (or SETI), all of it in Newton's city", (): void => {
    const { city, r, total } = setUp([new Research(10)], 0);

    expect(total(Research)).equal(10);
    r.cityImprovementRegistry.register(
      built(Library, city),
      built(University, city)
    );
    expect(total(Research)).equal(20);
    r.wonders.push(built(SetiProgram, cityOf()));
    expect(total(Research)).equal(25);
    r.cityImprovementRegistry.register(built(ResearchLab, city));
    expect(total(Research)).equal(25);
    r.wonders.push(built(IsaacNewtonsCollege, city));
    expect(total(Research)).equal(40);
  });

  it('adds 2/4 of the shields for a Factory, 2/4 for a Manufacturing Plant, and 2/4 for a plant no more than they do, each rounded down', (): void => {
    const { city, r, total } = setUp([new Production(10)], 0);

    r.cityImprovementRegistry.register(built(PowerPlant, city));
    expect(total(Production)).equal(10);
    r.cityImprovementRegistry.register(built(Factory, city));
    expect(total(Production)).equal(20);
    r.cityImprovementRegistry.register(built(ManufacturingPlant, city));
    expect(total(Production)).equal(25);

    const hoover = setUp([new Production(7)], 0);

    hoover.r.cityImprovementRegistry.register(built(Factory, hoover.city));
    hoover.r.wonders.push(built(HooverDam, cityOf()));
    // 7 + 14 >> 2 + 14 >> 2 = 7 + 3 + 3.
    expect(hoover.total(Production)).equal(13);
  });
});

describe('city:yield, squares and tithes', (): void => {
  it('a Harbour adds 1 food for each ocean square worked', (): void => {
    const { city, r, tiles, total } = setUp([new Food(4)], 0);

    tiles.push(
      { terrain: () => new Ocean() },
      { terrain: () => new Ocean() },
      { terrain: () => ({}) }
    );
    expect(total(Food)).equal(4);
    r.cityImprovementRegistry.register(built(Harbour, city));
    expect(total(Food)).equal(6);
  });

  it("under Fundamentalism pays the improvements' content as tithes, before the Marketplace", (): void => {
    const { city, r, total } = setUp([new Trade(0)], 0, Fundamentalism);

    const {
      CeremonialBurial,
      Mysticism,
    } = require('@civ-clone/civ2-science/Advances');

    r.known.push(CeremonialBurial, Mysticism);
    r.cityImprovementRegistry.register(
      built(require('../CityImprovements').Temple, city),
      built(Marketplace, city)
    );
    // The Temple's 2 content as 2 gold, and half of that again for the Marketplace.
    expect(total(Gold)).equal(3);
  });
});
