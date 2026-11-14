import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { Registries } from '../../lib/source';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
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
export declare const getRules: (
  dependencies?: PollutionDependencies
) => ProcessYield[];
export default getRules;
