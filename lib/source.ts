import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RequirementRegistry,
  instance as requirementRegistryInstance,
} from '@civ-clone/core-requirement/RequirementRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';

/** The registries an "improvement or Wonder" test reads. */
export interface Registries {
  cityImprovementRegistry?: CityImprovementRegistry;
  wonderRegistry?: WonderRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  requirementRegistry?: RequirementRegistry;
}

/** `registries` with every one filled in from the singletons. */
export const withDefaults = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
  wonderRegistry = wonderRegistryInstance,
  playerResearchRegistry = playerResearchRegistryInstance,
  requirementRegistry = requirementRegistryInstance,
}: Registries = {}): Required<Registries> => ({
  cityImprovementRegistry,
  wonderRegistry,
  playerResearchRegistry,
  requirementRegistry,
});

/** Whether `player` owns a standing `WonderType` that isn't obsolete (base-wonder's `playerOwnsWonder`). */
export const owns = (
  player: Player,
  WonderType: typeof Wonder,
  registries: Registries = {}
): boolean => {
  const { wonderRegistry, playerResearchRegistry, requirementRegistry } =
    withDefaults(registries);

  return playerOwnsWonder(
    player,
    WonderType,
    wonderRegistry,
    playerResearchRegistry,
    requirementRegistry
  );
};

/**
 * What gives `city` the effect Civilization II tests as "improvement or Wonder": its `Improvement`, or else its
 * player's standing, unobsolete `WonderType`, or `null`. One answer, so the two never stack (base-wonder's
 * `cityHasImprovementOrWonder` asks the same question).
 */
export const sourceOf = (
  city: City,
  Improvement: typeof CityImprovement,
  WonderType: typeof Wonder | null,
  registries: Registries = {}
): CityImprovement | null => {
  const { cityImprovementRegistry, wonderRegistry } = withDefaults(registries),
    improvement = improvementOf(city, Improvement, cityImprovementRegistry);

  if (improvement !== null || WonderType === null) {
    return improvement;
  }

  if (!owns(city.player(), WonderType, registries)) {
    return null;
  }

  return (
    wonderRegistry
      .getByPlayer(city.player())
      .find((wonder: Wonder): boolean => wonder instanceof WonderType) ?? null
  );
};

/** Whether `city` has `Improvement` or its player the Wonder that acts as one. */
export const hasEither = (
  city: City,
  Improvement: typeof CityImprovement,
  WonderType: typeof Wonder | null,
  registries: Registries = {}
): boolean => sourceOf(city, Improvement, WonderType, registries) !== null;
