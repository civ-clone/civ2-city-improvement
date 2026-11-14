import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { Registries, withDefaults } from '../../lib/source';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { pollution, rollRange } from '../../lib/pollution';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { POLLUTION_RULE } from '../../RuleIds';
import { Pollution } from '@civ-clone/civ2-world/TileImprovements';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Production } from '../../Yields';
import Yield from '@civ-clone/core-yield/Yield';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { pollute } from '@civ-clone/base-city-pollution/lib/pollute';
import { instance as rngInstance } from '@civ-clone/core-random';

export interface PollutionDependencies extends Registries {
  cityGrowthRegistry?: CityGrowthRegistry;
  cityRegistry?: CityRegistry;
  clientRegistry?: ClientRegistry;
  engine?: Engine;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  randomNumberGenerator?: () => number;
  ruleRegistry?: RuleRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}

// Each turn a person's city with pollution (`lib/pollution`) may pollute one of the squares around it; as Civ2, no
//  computer player's city does (OpenCiv2 `city_process_turn`, which calls `city_process_pollution` only for a human player,
//  richardpenman/civ2@49f26ec). Once a turn: the consolidated shields are processed once a city.
export const getRules = (
  dependencies: PollutionDependencies = {}
): ProcessYield[] => {
  const registries = withDefaults(dependencies),
    {
      cityGrowthRegistry = cityGrowthRegistryInstance,
      cityRegistry = cityRegistryInstance,
      clientRegistry = clientRegistryInstance,
      engine = engineInstance,
      gameDifficultyRegistry = gameDifficultyRegistryInstance,
      randomNumberGenerator = rngInstance,
      ruleRegistry = ruleRegistryInstance,
      tileImprovementRegistry = tileImprovementRegistryInstance,
    } = dependencies;

  return [
    new ProcessYield(
      POLLUTION_RULE,
      new Criterion(
        (cityYield: Yield): boolean => cityYield instanceof Production
      ),
      new Criterion((cityYield: Yield, city: City): boolean =>
        isHuman(city.player(), clientRegistry)
      ),
      new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void =>
        pollute(
          city,
          pollution(
            city,
            cityYields,
            registries,
            ruleRegistry,
            cityGrowthRegistry
          ),
          {
            Pollution,
            rollRange: rollRange(
              (): number => levelOf(gameDifficultyRegistry),
              registries
            ),
          },
          {
            cityRegistry,
            tileImprovementRegistry,
            ruleRegistry,
            engine,
            randomNumberGenerator,
          }
        )
      )
    ),
  ];
};

export default getRules;
