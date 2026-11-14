import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries } from '../../lib/source';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
export interface YieldDependencies extends Registries {
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}
export declare const getRules: (
  dependencies?: YieldDependencies
) => YieldRule[];
export default getRules;
