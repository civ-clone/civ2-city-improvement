import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { MeltdownDependencies } from '../../lib/meltdown';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
export interface MeltdownRuleDependencies extends MeltdownDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
}
export declare const getRules: (
  dependencies?: MeltdownRuleDependencies
) => ProcessYield[];
export default getRules;
