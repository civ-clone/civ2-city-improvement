import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries } from '../../lib/source';
import Cost from '@civ-clone/core-city/Rules/Cost';
export interface CostDependencies extends Registries {
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}
export declare const getRules: (dependencies?: CostDependencies) => Cost[];
export default getRules;
