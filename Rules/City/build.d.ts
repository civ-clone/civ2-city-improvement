import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { Registries } from '../../lib/source';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import { Build } from '@civ-clone/core-city-build/Rules/Build';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** An improvement is built once in each city. */
export declare const notBuilt: (
  cityImprovementRegistry?: CityImprovementRegistry
) => Build;
/**
 * The improvements only built where the map allows (OpenCiv2 `city_can_build_improvement`): a Harbour and an Offshore
 *  Platform on the coast, a Port Facility and a Coastal Fortress with access to the ocean, and a Hydro Plant by a river
 *  or mountains (`lib/site`).
 */
export declare const siteRules: (
  terrainFeatureRegistry?: TerrainFeatureRegistry
) => Build[];
/**
 * The improvements a Wonder its player owns already stands in for (OpenCiv2 `city_can_build_improvement`): no Granary
 *  with the Pyramids, Cathedral with Michelangelo's, Police Station with Women's Suffrage, Research Lab with SETI, or
 *  Power, Hydro or Nuclear Plant with the Hoover Dam.
 */
export declare const wonderExclusions: [
  typeof CityImprovement,
  typeof Wonder
][];
export declare const wonderExclusionRules: (registries?: Registries) => Build[];
/**
 * Every rule about which improvements a city may build, for a rule registry without a game's `requirements` (tests):
 *  a game's are registered through `game.requirements` (`registerRules`).
 */
export declare const getRules: (
  cityImprovementRegistry?: CityImprovementRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  terrainFeatureRegistry?: TerrainFeatureRegistry,
  registries?: Registries
) => Build[];
export default getRules;
