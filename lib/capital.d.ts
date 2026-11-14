import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { Registries } from './source';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
export interface CapitalDependencies extends Registries {
  cityGrowthRegistry?: CityGrowthRegistry;
  cityRegistry?: CityRegistry;
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerTreasuryRegistry?: PlayerTreasuryRegistry;
  ruleRegistry?: RuleRegistry;
  unitRegistry?: UnitRegistry;
}
/** `player`'s standing Palace's city, or `null`. */
export declare const capitalOf: (
  player: Player,
  { cityImprovementRegistry }?: Registries
) => City | null;
/**
 * Where a computer player whose capital was just taken moves its Palace, if it does (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape`, richardpenman/civ2@49f26ec): only above Prince, with more than 999 gold, and
 *  more than 11 cities or more than 1999 gold, into its best city of size 8 or more and at least half the captured
 *  city's size. A city scores 3 a citizen, less its distance from the captured city, plus 4 for each point of defence
 *  on its square; × 1.5 with a SAM Missile Battery, × 2 with City Walls (or the Great Wall) and × 3 with an SDI Defense.
 *  `null` when it doesn't.
 */
export declare const palaceEscape: (
  captured: City,
  loser: Player,
  dependencies?: CapitalDependencies
) => City | null;
/** Moves `loser`'s Palace to `city` for `palaceEscapeCost` gold. */
export declare const escapeTo: (
  city: City,
  loser: Player,
  { playerTreasuryRegistry, ruleRegistry }?: CapitalDependencies
) => void;
