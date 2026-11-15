import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
export interface TileYieldDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}
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
export declare const getRules: ({
  cityImprovementRegistry,
  tileImprovementRegistry,
}?: TileYieldDependencies) => CityTileYield[];
export default getRules;
