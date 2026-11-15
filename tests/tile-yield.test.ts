import {
  Farmland,
  Railroad,
  Road,
} from '@civ-clone/civ2-world/TileImprovements';
import { Food, Production, Trade } from '../Yields';
import {
  Harbour,
  OffshorePlatform,
  Superhighways,
  Supermarket,
} from '../CityImprovements';
import { built, cityOf } from './lib/stubs';
import City from '@civ-clone/core-city/City';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import Effect from '@civ-clone/core-rule/Effect';
import { Ocean } from '@civ-clone/civ2-world/Terrains';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';
import { tileYieldPriority } from '@civ-clone/civ2-city/lib/tileYieldPipeline';
import tileYieldRules from '../Rules/City/tile-yield';
import { totalOf } from '@civ-clone/base-tile-improvement/lib/yieldModifiers';

// Civ2's terrain rows (RULES.TXT @TERRAIN): Ocean 1/0/2, Fish 3/0/2; Grassland 2/0/0, +1 food irrigated.
const yieldTypes = [Food, Production, Trade];

/**
 * A stand-in for civ2-city's Despotism step (`governmentPenalty`, `city_tile_yield` ~2909–2917): a yield over 2 loses
 * 1, unless the city celebrates.
 */
const despotism = new CityTileYield(
  'test:despotism',
  tileYieldPriority('governmentPenalty'),
  new Effect((city: City, tile: Tile, yields: Yield[]): void =>
    yieldTypes.forEach((YieldType) => {
      if (totalOf(yields, YieldType) > 2) {
        yields.push(new YieldType(-1, 'despotism'));
      }
    })
  )
);

const setUp = (Despotism = false) => {
  const ruleRegistry = new RuleRegistry(),
    cityImprovementRegistry = new CityImprovementRegistry(),
    tileImprovements = new Map<Tile, TileImprovement[]>(),
    centre = { terrain: () => ({}), yields: () => [] } as unknown as Tile,
    city = cityOf('p', {
      _ruleRegistry: ruleRegistry,
      tile: () => centre,
    });

  ruleRegistry.register(
    ...tileYieldRules({
      cityImprovementRegistry,
      tileImprovementRegistry: {
        getByTile: (tile: Tile) => tileImprovements.get(tile) ?? [],
      } as any,
    }),
    ...(Despotism ? [despotism] : [])
  );

  const square = (
      [food, shields, trade]: number[],
      ocean = false,
      ...improvements: (typeof TileImprovement)[]
    ): Tile => {
      const tile = {
        terrain: () => (ocean ? new Ocean() : {}),
        // As civ2-world gives them: one yield per step, the terrain's first.
        yields: () => [
          new Food(food, 'terrain'),
          new Production(shields, 'terrain'),
          new Trade(trade, 'terrain'),
        ],
      } as unknown as Tile;

      tileImprovements.set(
        tile,
        improvements.map((Type) => Object.create(Type.prototype))
      );

      return tile;
    },
    gives = (tile: Tile): number[] => {
      const yields = City.prototype.tileYields.call(city, tile);

      return yieldTypes.map((YieldType) => totalOf(yields, YieldType));
    },
    build = (...Improvements: any[]) =>
      cityImprovementRegistry.register(
        ...Improvements.map((Improvement) => built(Improvement, city))
      );

  return { build, centre, city, gives, square };
};

describe('city:tile-yield, the Harbour and the Offshore Platform', (): void => {
  it('adds 1 food (Harbour) and 1 shield (Offshore Platform) to an ocean square, and nothing on land', (): void => {
    const { build, gives, square } = setUp(),
      ocean = square([1, 0, 2], true),
      land = square([2, 1, 0]);

    build(Harbour, OffshorePlatform);

    expect(gives(ocean)).eql([2, 1, 2]);
    expect(gives(land)).eql([2, 1, 0]);
  });

  it('comes before the Despotism penalty: Fish with a Harbour give 4 food, then 3 (city_tile_yield ~2835, ~2909)', (): void => {
    const { build, gives, square } = setUp(true),
      fish = square([3, 0, 2], true),
      ocean = square([1, 0, 2], true);

    // Fish alone: 3, over 2, so 2. With a Harbour: 4, so 3; plain ocean: 2, not over 2, so 2.
    expect(gives(fish)).eql([2, 0, 2]);
    build(Harbour);
    expect(gives(fish)).eql([3, 0, 2]);
    expect(gives(ocean)).eql([2, 0, 2]);
  });
});

describe('city:tile-yield, the Supermarket', (): void => {
  it('adds half the food, rounded down, on farmland and on the city square, and nowhere else (city_tile_yield ~2851–2858)', (): void => {
    const { build, centre, gives, square } = setUp(),
      farmland = square([3, 0, 0], false, Farmland),
      irrigated = square([3, 0, 0]),
      ocean = square([1, 0, 2], true, Farmland);

    build(Supermarket);

    expect(gives(farmland)).eql([4, 0, 0]);
    expect(gives(irrigated)).eql([3, 0, 0]);
    expect(gives(ocean)).eql([1, 0, 2]);
    (centre as any).yields = () => [new Food(5, 'terrain')];
    expect(gives(centre)[0]).equal(7);
  });

  it('comes before the Despotism penalty: irrigated Grassland on farmland gives 3 + 1 = 4, then 3', (): void => {
    const { build, gives, square } = setUp(true),
      farmland = square([3, 0, 0], false, Farmland);

    // Without a Supermarket, 3 food is over 2, so 2. With one, 4, so 3.
    expect(gives(farmland)[0]).equal(2);
    build(Supermarket);
    expect(gives(farmland)[0]).equal(3);
  });
});

describe('city:tile-yield, Superhighways', (): void => {
  it('adds half the trade, rounded down, on a road, a railroad and the city square (city_tile_yield ~2926)', (): void => {
    const { build, centre, gives, square } = setUp(),
      road = square([2, 0, 3], false, Road),
      railroad = square([2, 0, 3], false, Railroad),
      plain = square([2, 0, 3]);

    build(Superhighways);

    expect(gives(road)[2]).equal(4);
    expect(gives(railroad)[2]).equal(4);
    expect(gives(plain)[2]).equal(3);
    (centre as any).yields = () => [new Trade(5, 'terrain')];
    expect(gives(centre)[2]).equal(7);
  });

  it("comes after the government's steps: 4 trade under Despotism is 3, then 4, not 6 then 5", (): void => {
    const { build, gives, square } = setUp(true),
      road = square([2, 0, 4], false, Road);

    build(Superhighways);

    expect(gives(road)[2]).equal(4);
  });
});
