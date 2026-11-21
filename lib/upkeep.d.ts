import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerGovernmentRegistry } from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries } from './source';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import Advance from '@civ-clone/core-science/Advance';
export interface UpkeepDependencies extends Registries {
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}
/** The advances that each make Barracks cost `barracksAdvanceUpkeep` more, and sell them when discovered. */
export declare const barracksAdvances: (typeof Advance)[];
/** The improvements Fundamentalism keeps for nothing. */
export declare const freeUnderFundamentalism: (typeof CityImprovement)[];
/**
 * What each improvement costs `player` in gold a turn (OpenCiv2 `src/auto/civ.cpp` `civ_improvement_upkeep`,
 *  richardpenman/civ2@49f26ec): its @IMPROVE upkeep; Barracks 1 less below Prince, 1 more with Gunpowder and 1 more
 *  with Mobile Warfare; nothing for an upkeep of 1 with Adam Smith's; and nothing for a Temple, Colosseum or Cathedral
 *  under Fundamentalism. The player's research, Wonders and government are each asked at most once, on first need, so
 *  one city's improvements can share the answer.
 */
export declare const upkeepFor: (
  player: Player,
  {
    gameDifficultyRegistry,
    playerGovernmentRegistry,
    ...registries
  }?: UpkeepDependencies
) => (Improvement: typeof CityImprovement) => number;
/**
 * What Barracks cost, as `upkeepFor` reckons it, at each stage: below Prince or from Prince up (`below`), and with how
 *  many of `barracksAdvances` known (the stage after the `index`th of them, as Mobile Warfare comes after Gunpowder).
 */
export declare const barracksUpkeep: (
  below: boolean,
  advancesKnown: number
) => number;
/** What `Improvement` costs `player` in gold a turn (`upkeepFor`). */
export declare const upkeep: (
  Improvement: typeof CityImprovement,
  player: Player,
  dependencies?: UpkeepDependencies
) => number;
/** Whether `player`'s cities pay upkeep at all: not under Anarchy (OpenCiv2 `city_pay_improvement_upkeep`). */
export declare const paysUpkeep: (
  player: Player,
  playerGovernmentRegistry?: PlayerGovernmentRegistry
) => boolean;
export default upkeep;
