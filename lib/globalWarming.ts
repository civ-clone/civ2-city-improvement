import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  Desert,
  Forest,
  Grassland,
  Jungle,
  Plains,
  Swamp,
} from '@civ-clone/civ2-world/Terrains';
import { warmingInlandOceansBelow, warmingPatternMask } from '../data/rules';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { SolarPlant } from '../CityImprovements';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';

// Civilization II's global warming, numbered for `base-global-warming`: OpenCiv2 `src/auto/game.cpp`
//  `game_update_global_warming` (00486c2e) and `src/auto/map.cpp` `map_apply_global_warming` (004868fb),
//  richardpenman/civ2@49f26ec. The numbers are in `data/rules.ts`.

/**
 * The square's x as the original numbers it: on a staggered isometric map, in half squares (`x2 += 2`, odd rows
 *  starting at 1), as the warming pattern reads it. On any other grid, its own x.
 */
export const civ2X = (tile: Tile): number =>
  tile.map().topologyId() === 'staggered-iso'
    ? 2 * tile.x() + (tile.y() & 1)
    : tile.x();

/**
 * The directions `map_apply_global_warming` looks for ocean in, as the original reads them. Its loop takes 20 offsets
 *  from the 8-entry direction table (`dir_dx_table`, `dir_dy_table`) and reads past its end (the "Bug?" of RULES §6).
 *  What it reads there is fixed by the tables' place in memory (OpenCiv2 `src/data/state/ai.h`, `gamedata.cpp`): entries
 *  8 to 15 are 0 in both tables, the square itself, which is never ocean here; entries 16 to 19 are the next tables'
 *  first values, the offsets (−1, 1), (0, 2), (1, 1) and (2, 0) in half squares, the square's south-west, south,
 *  south-east and east neighbours again. So those four count twice. Named as on the staggered isometric grid
 *  (core-world's `StaggeredIsoTopology`): `dir_dx_table` is north-east, east, south-east, south, south-west, west,
 *  north-west, north. A grid without one of these directions skips it.
 */
export const oceanDirections: readonly string[] = Object.freeze([
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'n',
  'sw',
  's',
  'se',
  'e',
]);

/**
 * How many of `oceanDirections`' squares around `tile` are water, each counted as often as it's listed. A square past
 *  the map's top or bottom row isn't counted (`map_in_bounds`): Civilization II's map doesn't wrap north to south, though
 *  core-world's grids do.
 */
export const oceansAround = (tile: Tile): number => {
  const world = tile.map(),
    topology = world.topology(),
    directions = topology.directions() as readonly string[];

  return oceanDirections.filter((direction: string): boolean => {
    if (!directions.includes(direction)) {
      return false;
    }

    const [dx, dy] = topology.offset(direction as never, tile.x(), tile.y()),
      y = tile.y() + dy;

    return (
      y >= 0 && y < world.height() && world.get(tile.x() + dx, y).isWater()
    );
  }).length;
};

/**
 * Whether a warming changes `tile` as an inland square: fewer oceans around it than 7 less the warmings so far. From the
 *  seventh warming on, none is (`oceans < 0`), so every square takes the coastal change.
 */
export const isInland = (tile: Tile, warmings: number): boolean =>
  oceansAround(tile) < warmingInlandOceansBelow - warmings;

/** Whether an inland `tile` is on the warming's pattern: `(3x − 3y) & 7` is the warmings so far (none after the eighth). */
export const onPattern = (tile: Tile, warmings: number): boolean =>
  ((3 * civ2X(tile) - 3 * tile.y()) & warmingPatternMask) === warmings;

/**
 * What a warming makes of `tile`, given the warmings before it (`map_apply_global_warming`), or `null` to leave it:
 *  - only Desert, Plains, Grassland and Forest change;
 *  - inland, on the pattern only, Desert and Plains become Desert, Grassland and Forest Plains;
 *  - otherwise (every such square, with no pattern) Forest becomes Jungle and the rest Swamp.
 * Irrigation, Farmland and a Mine go with the coastal change by civ2-world's `TerrainChanged` rule, as neither Swamp nor
 *  Jungle keeps them; the original keeps what an inland square has, and so does that rule.
 */
export const warmedTerrain = (
  tile: Tile,
  warmings: number
): typeof Terrain | null => {
  const terrain = tile.terrain();

  if (
    !(
      terrain instanceof Desert ||
      terrain instanceof Plains ||
      terrain instanceof Grassland ||
      terrain instanceof Forest
    )
  ) {
    return null;
  }

  if (isInland(tile, warmings)) {
    if (!onPattern(tile, warmings)) {
      return null;
    }

    return terrain instanceof Desert || terrain instanceof Plains
      ? Desert
      : Plains;
  }

  return terrain instanceof Forest ? Jungle : Swamp;
};

export interface WarmingDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  clientRegistry?: ClientRegistry;
}

/**
 * For each square, how many computer players' cities (the barbarians' included) have it in their radius: the original's
 *  `w` counts a polluted square once for each such city as it processes the city (`city_calc_tile_flags`, city.cpp
 *  004e7641, the 21 squares only). Here it is the cities standing when it's asked.
 */
export const computerCityRadii = ({
  cityRegistry = cityRegistryInstance,
  clientRegistry = clientRegistryInstance,
}: WarmingDependencies = {}): ((tile: Tile) => number) => {
  const counts = new Map<Tile, number>();

  cityRegistry
    .entries()
    .filter(
      (city: City): boolean =>
        !city.destroyed() && !isHuman(city.player(), clientRegistry)
    )
    .forEach((city: City): void =>
      city
        .tiles()
        .entries()
        .forEach((tile: Tile): void => {
          counts.set(tile, (counts.get(tile) ?? 0) + 1);
        })
    );

  return (tile: Tile): number => counts.get(tile) ?? 0;
};

/** How many cities have a Solar Plant, whoever's they are. */
export const solarPlantCities = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
}: WarmingDependencies = {}): number =>
  new Set(
    cityImprovementRegistry
      .getByType(SolarPlant)
      .map((improvement: CityImprovement): City => improvement.city())
      .filter((city: City): boolean => !city.destroyed())
  ).size;
