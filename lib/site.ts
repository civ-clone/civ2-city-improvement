import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import { Mountains } from '@civ-clone/civ2-world/Terrains';
import City from '@civ-clone/core-city/City';
import { River } from '@civ-clone/civ2-world/TerrainFeatures';
import Tile from '@civ-clone/core-world/Tile';

// OpenCiv2 `src/auto/city.cpp` `city_create` (richardpenman/civ2@49f26ec) sets a city's site flags from the 9 squares
//  of its own and its neighbours': `CITYF_COASTAL` for any ocean, `CITYF_OCEAN_ACCESS` for ocean that is more than a
//  one-square lake, and `CITYF_HYDRO_POSSIBLE` for a river or mountains.

const around = (city: City): Tile[] => [
  city.tile(),
  ...city.tile().getNeighbours(),
];

/** Water on the city's square or next to it: a Harbour and an Offshore Platform need it. */
export const isCoastal = (city: City): boolean =>
  around(city).some((tile: Tile): boolean => tile.isWater());

/**
 * Water next to the city that isn't a one-square lake: a Port Facility and a Coastal Fortress need it. Approximated by
 *  a water square with another water square beside it.
 */
export const hasOceanAccess = (city: City): boolean =>
  around(city).some(
    (tile: Tile): boolean =>
      tile.isWater() &&
      tile.getNeighbours().some((other: Tile): boolean => other.isWater())
  );

/** A river or mountains on the city's square or next to it: a Hydro Plant needs one. */
export const isHydroSite = (
  city: City,
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance
): boolean =>
  around(city).some(
    (tile: Tile): boolean =>
      tile.terrain() instanceof Mountains ||
      terrainFeatureRegistry
        .getByTerrain(tile.terrain())
        .some((feature) => feature instanceof River)
  );
