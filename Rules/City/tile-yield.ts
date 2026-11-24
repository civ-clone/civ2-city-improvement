import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  Farmland,
  Railroad,
  Road,
} from '@civ-clone/civ2-world/TileImprovements';
import { Food, Production, Trade } from '../../Yields';
import {
  Harbour,
  OffshorePlatform,
  Superhighways,
  Supermarket,
} from '../../CityImprovements';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import {
  harbourFood,
  offshorePlatformProduction,
  superhighwaysDivisor,
  supermarketShift,
} from '../../data/rules';
import Effect from '@civ-clone/core-rule/Effect';
import { Ocean } from '@civ-clone/civ2-world/Terrains';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Yield from '@civ-clone/core-yield/Yield';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import { tileYieldPriority } from '@civ-clone/civ2-city/lib/tileYieldPipeline';
import { totalOf } from '@civ-clone/base-tile-improvement/lib/yieldModifiers';

export interface TileYieldDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}

const isOcean = (tile: Tile): boolean => tile.terrain() instanceof Ocean;

/**
 * What the city's improvements add to each square it works, at their steps of OpenCiv2's `city_tile_yield`
 *  (`src/auto/city.cpp` ~2796, richardpenman/civ2@49f26ec), in civ2-city's order (`lib/tileYieldPipeline`). Each step
 *  adds a new yield of the type, named for the improvement, to the square's yields for this city:
 *
 * - `harbour` (~2835): +1 food on an ocean square.
 * - `offshorePlatform` (~2838): +1 shield on an ocean square.
 * - `supermarket` (~2851–2858): food += food >> 1 on farmland or the city's own square (which counts as farmland,
 *   `TILE_CITY`), on land, after the irrigation.
 * - `superhighways` (~2926–2929): trade += trade / 2 on a square with a road or the city's own square, after the
 *   government's penalty and trade bonus and before pollution.
 */
export const getRules = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
  tileImprovementRegistry = tileImprovementRegistryInstance,
}: TileYieldDependencies = {}): CityTileYield[] => {
  const has =
      (Improvement: typeof CityImprovement) =>
      (city: City): boolean =>
        improvementOf(city, Improvement, cityImprovementRegistry) !== null,
    hasOn = (tile: Tile, ...Types: (typeof TileImprovement)[]): boolean =>
      tileImprovementRegistry
        .getByTile(tile)
        .some((improvement: TileImprovement): boolean =>
          Types.some((Type) => improvement instanceof Type)
        ),
    adds =
      (
        YieldType: typeof Yield,
        amount: (total: number) => number,
        provider: string
      ) =>
      (city: City, tile: Tile, yields: Yield[]): void => {
        const added = amount(totalOf(yields, YieldType));

        if (added !== 0) {
          yields.push(new YieldType(added, provider));
        }
      };

  return [
    new CityTileYield(
      `civ2-city-improvement:city/tile-yield/${Harbour.name}`,
      tileYieldPriority('harbour'),
      new Criterion((city: City, tile: Tile): boolean => isOcean(tile)),
      new Criterion(has(Harbour)),
      new Effect(adds(Food, () => harbourFood, Harbour.name)),
      new Description({
        type: 'tile_yield',
        subject: Harbour,
        yield: Food,
        value: harbourFood,
        on: 'ocean',
      })
    ),

    new CityTileYield(
      `civ2-city-improvement:city/tile-yield/${OffshorePlatform.name}`,
      tileYieldPriority('offshorePlatform'),
      new Criterion((city: City, tile: Tile): boolean => isOcean(tile)),
      new Criterion(has(OffshorePlatform)),
      new Effect(
        adds(
          Production,
          () => offshorePlatformProduction,
          OffshorePlatform.name
        )
      ),
      new Description({
        type: 'tile_yield',
        subject: OffshorePlatform,
        yield: Production,
        value: offshorePlatformProduction,
        on: 'ocean',
      })
    ),

    new CityTileYield(
      `civ2-city-improvement:city/tile-yield/${Supermarket.name}`,
      tileYieldPriority('supermarket'),
      new Criterion(has(Supermarket)),
      new Criterion((city: City, tile: Tile): boolean => !isOcean(tile)),
      new Criterion(
        (city: City, tile: Tile): boolean =>
          tile === city.tile() || hasOn(tile, Farmland)
      ),
      new Effect(
        adds(Food, (food) => food >> supermarketShift, Supermarket.name)
      ),
      new Description(
        {
          type: 'tile_yield_percent',
          subject: Supermarket,
          yield: Food,
          value: 1 / (1 << supermarketShift),
          on: 'farmland',
        },
        // The same, on Farmland's own entry (civ-clone/web-renderer#1272).
        {
          type: 'square_yield_percent',
          subject: Farmland,
          yield: Food,
          value: 1 / (1 << supermarketShift),
          inCitiesWith: Supermarket,
        }
      )
    ),

    new CityTileYield(
      `civ2-city-improvement:city/tile-yield/${Superhighways.name}`,
      tileYieldPriority('superhighways'),
      new Criterion(has(Superhighways)),
      // A railroad is built on a road, so Civ2's road bit is set on it too.
      new Criterion(
        (city: City, tile: Tile): boolean =>
          tile === city.tile() || hasOn(tile, Road, Railroad)
      ),
      new Effect(
        adds(
          Trade,
          (trade) => Math.trunc(trade / superhighwaysDivisor),
          Superhighways.name
        )
      ),
      new Description({
        type: 'tile_yield_percent',
        subject: Superhighways,
        yield: Trade,
        value: 1 / superhighwaysDivisor,
        on: 'roads',
      })
    ),
  ];
};

export default getRules;
