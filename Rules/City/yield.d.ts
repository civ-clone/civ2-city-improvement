import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries } from '../../lib/source';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
export interface YieldDependencies extends Registries {
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}
export declare const getRules: (
  dependencies?: YieldDependencies
) => YieldRule[];
export default getRules;
