import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RequirementRegistry } from '@civ-clone/core-requirement/RequirementRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** The registries an "improvement or Wonder" test reads. */
export interface Registries {
  cityImprovementRegistry?: CityImprovementRegistry;
  wonderRegistry?: WonderRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
}
/** `registries` with every one filled in from the singletons. */
export declare const withDefaults: ({
  cityImprovementRegistry,
  wonderRegistry,
  playerResearchRegistry,
  requirementRegistry,
}?: Registries) => Required<Registries>;
/** Whether `player` owns a standing `WonderType` that isn't obsolete (base-wonder's `playerOwnsWonder`). */
export declare const owns: (
  player: Player,
  WonderType: typeof Wonder,
  registries?: Registries
) => boolean;
/**
 * What gives `city` the effect Civilization II tests as "improvement or Wonder": its `Improvement`, or else its
 * player's standing, unobsolete `WonderType`, or `null`. One answer, so the two never stack (base-wonder's
 * `cityHasImprovementOrWonder` asks the same question).
 */
export declare const sourceOf: (
  city: City,
  Improvement: typeof CityImprovement,
  WonderType: typeof Wonder | null,
  registries?: Registries
) => CityImprovement | null;
/** Whether `city` has `Improvement` or its player the Wonder that acts as one. */
export declare const hasEither: (
  city: City,
  Improvement: typeof CityImprovement,
  WonderType: typeof Wonder | null,
  registries?: Registries
) => boolean;
