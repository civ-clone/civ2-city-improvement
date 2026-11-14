import { Corruption, Food, Gold, Production, Trade } from '../../Yields';
import {
  Courthouse,
  Harbour,
  OffshorePlatform,
  Palace,
  Superhighways,
} from '../../CityImprovements';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries, withDefaults } from '../../lib/source';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import { COURTHOUSE_RULE } from '../../RuleIds';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { FUNDAMENTALISM } from '@civ-clone/civ2-rules/data/governments';
import { Ocean } from '@civ-clone/civ2-world/Terrains';
import Priority from '@civ-clone/core-rule/Priority';
import { Road } from '@civ-clone/civ2-world/TileImprovements';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import { contents } from '../../lib/content';
import governmentOf from '@civ-clone/civ2-city/lib/government';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface YieldDependencies extends Registries {
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}

// Squares' bonuses come after civ2-city's worked squares (0) and before its corruption (`High`, 1000); the Courthouse
//  after the corruption and before civ2-trade-rate's split (`Normal`, 2000); the tithes after the split.
const SQUARES = 500,
  COURTHOUSE = 1500,
  TITHES = 2500;

const ocean = (city: City): Tile[] =>
  city
    .tilesWorked()
    .entries()
    .filter((tile: Tile): boolean => tile.terrain() instanceof Ocean);

export const getRules = (dependencies: YieldDependencies = {}): YieldRule[] => {
  const registries = withDefaults(dependencies),
    {
      playerGovernmentRegistry = playerGovernmentRegistryInstance,
      tileImprovementRegistry = tileImprovementRegistryInstance,
    } = dependencies,
    has = (city: City, Improvement: typeof CityImprovement): boolean =>
      improvementOf(city, Improvement, registries.cityImprovementRegistry) !==
      null,
    tithes = (city: City): number =>
      contents.reduce(
        (total: number, content): number =>
          total + (content(city, registries)?.value ?? 0),
        0
      );

  return [
    // OpenCiv2 `city_tile_yield` (richardpenman/civ2@49f26ec): a Harbour adds 1 food to each ocean square the city
    //  works, an Offshore Platform 1 shield.
    ...(
      [
        [Harbour, Food],
        [OffshorePlatform, Production],
      ] as [typeof CityImprovement, typeof Yield][]
    ).map(
      ([Improvement, YieldType]) =>
        new YieldRule(
          `civ2-city-improvement:city/yield/${Improvement.name}`,
          new Priority(SQUARES),
          new Criterion((city: City): boolean => has(city, Improvement)),
          new Criterion((city: City): boolean => ocean(city).length > 0),
          new Effect(
            (city: City): Yield =>
              new YieldType(ocean(city).length, Improvement.name)
          )
        )
    ),

    // `city_tile_yield`: Superhighways add half the trade (rounded down) of each square with a road (or the city).
    new YieldRule(
      `civ2-city-improvement:city/yield/${Superhighways.name}`,
      new Priority(SQUARES),
      new Criterion((city: City): boolean => has(city, Superhighways)),
      new Effect(
        (city: City): Yield =>
          new Trade(
            city
              .tilesWorked()
              .entries()
              .filter(
                (tile: Tile): boolean =>
                  tile === city.tile() ||
                  tileImprovementRegistry
                    .getByTile(tile)
                    .some((improvement) => improvement instanceof Road)
              )
              .reduce(
                (total: number, tile: Tile): number =>
                  total +
                  Math.floor(
                    reduceYield(tile.yields(city.player()), Trade) / 2
                  ),
                0
              ),
            Superhighways.name
          )
      )
    ),

    // `city_calc_corruption`: a Courthouse or the Palace halves the city's corruption, once, rounding what's left down.
    //  The Palace's halving is civ2-city's, so a Courthouse in the Palace's city (a capital moved or rebuilt there) adds
    //  nothing.
    new YieldRule(
      COURTHOUSE_RULE,
      new Priority(COURTHOUSE),
      new Criterion((city: City): boolean => has(city, Courthouse)),
      new Criterion((city: City): boolean => !has(city, Palace)),
      new Criterion(
        (city: City, yields: Yield[]): boolean =>
          reduceYield(yields, Corruption) < 0
      ),
      new Effect(
        (city: City, yields: Yield[]): Yield =>
          // Corruption is a negative yield: a negative value given back to it takes from what's lost.
          new Corruption(
            Math.floor(reduceYield(yields, Corruption) / 2),
            Courthouse.name
          )
      )
    ),

    // `city_split_trade`: under Fundamentalism the improvements' content citizens are paid as tithes, in gold, before
    //  the Marketplace's bonus.
    new YieldRule(
      'civ2-city-improvement:city/yield/tithes',
      new Priority(TITHES),
      new Criterion(
        (city: City): boolean =>
          governmentOf(city.player(), playerGovernmentRegistry) ===
          FUNDAMENTALISM
      ),
      new Criterion((city: City): boolean => tithes(city) > 0),
      new Effect((city: City): Yield => new Gold(tithes(city), 'tithes'))
    ),
  ];
};

export default getRules;
