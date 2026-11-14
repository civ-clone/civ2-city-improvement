import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import City from '@civ-clone/core-city/City';
/** Water on the city's square or next to it: a Harbour and an Offshore Platform need it. */
export declare const isCoastal: (city: City) => boolean;
/**
 * Water next to the city that isn't a one-square lake: a Port Facility and a Coastal Fortress need it. Approximated by
 *  a water square with another water square beside it.
 */
export declare const hasOceanAccess: (city: City) => boolean;
/**
 * A river or mountains on the city's square or next to it: a Hydro Plant needs one (civ2-world's `hydroPossible`). Civ2
 *  decides it once, when the city is founded; this asks the map as it is now.
 */
export declare const isHydroSite: (
  city: City,
  terrainFeatureRegistry?: TerrainFeatureRegistry
) => boolean;
