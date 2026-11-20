import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  MeltdownDependencies,
  meltdown,
  meltdownOdds,
} from '../../lib/meltdown';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import { FusionPower } from '@civ-clone/civ2-science/Advances';
import { MELTDOWN_RULE } from '../../RuleIds';
import { NuclearPlant } from '../../CityImprovements';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Production } from '../../Yields';
import Yield from '@civ-clone/core-yield/Yield';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import { inCivilDisorder } from '@civ-clone/base-city-happiness/lib/civilDisorder';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { instance as rngInstance } from '@civ-clone/core-random';

export interface MeltdownRuleDependencies extends MeltdownDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
}

// OpenCiv2 `city_process_pollution` (`src/game/retvals.cpp` ~1460, richardpenman/civ2@49f26ec), after the pollution roll
//  and only for a person's city, as `city_process_turn` calls it: a city in civil disorder with a Nuclear Plant, whose
//  player doesn't know Fusion Power, melts down 1 time in (6 − level) (`lib/meltdown`). The disorder is the city's
//  this turn, as `city_process_disorder` has just set it: the ruleset's `CivilDisorder` rules on the turn's yields.
export const getRules = (
  dependencies: MeltdownRuleDependencies = {}
): ProcessYield[] => {
  const {
    clientRegistry = clientRegistryInstance,
    gameDifficultyRegistry = gameDifficultyRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
    randomNumberGenerator = rngInstance,
    ruleRegistry = ruleRegistryInstance,
  } = dependencies;

  return [
    new ProcessYield(
      MELTDOWN_RULE,
      new Criterion(
        (cityYield: Yield): boolean => cityYield instanceof Production
      ),
      new Criterion((cityYield: Yield, city: City): boolean =>
        isHuman(city.player(), clientRegistry)
      ),
      new Criterion(
        (cityYield: Yield, city: City): boolean =>
          improvementOf(
            city,
            NuclearPlant,
            dependencies.cityImprovementRegistry
          ) !== null
      ),
      new Criterion(
        (cityYield: Yield, city: City): boolean =>
          !playerResearchRegistry
            .getByPlayer(city.player())
            .completed(FusionPower)
      ),
      new Criterion(
        (cityYield: Yield, city: City, cityYields: Yield[]): boolean =>
          inCivilDisorder(city, cityYields, ruleRegistry)
      ),
      // The roll only once every condition holds, so nothing else's rolls move.
      new Effect((cityYield: Yield, city: City): void => {
        if (
          randomNumberGenerator() <
          meltdownOdds(levelOf(gameDifficultyRegistry))
        ) {
          meltdown(city, dependencies);
        }
      }),
      new Description({
        type: 'meltdown',
        subject: NuclearPlant,
        until: FusionPower,
      })
    ),
  ];
};

export default getRules;
