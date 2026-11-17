import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { LandMassRegistry } from '@civ-clone/core-world/LandMassRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { Registries } from './source';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
export interface CapitalDependencies extends Registries {
  cityGrowthRegistry?: CityGrowthRegistry;
  landMassRegistry?: LandMassRegistry;
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
/** How much gold `player` has. */
export declare const goldOf: (
  player: Player,
  { playerTreasuryRegistry }?: CapitalDependencies
) => number;
/**
 * The city `loser`'s Palace could escape to once its capital is taken (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape` ~4717, richardpenman/civ2@49f26ec), whoever plays it: its best city of size 8
 *  or more and at least half the captured city's size. A city scores 3 a citizen, less its distance from the captured
 *  city, plus 4 for each point of defence on its square; then, each with C's integer arithmetic, × 3 / 2 with a SAM
 *  Missile Battery, × 2 with City Walls (or the Great Wall), × 3 with an SDI Defense, and / 2 on another land mass. The
 *  first best score wins. `null` when no city qualifies.
 */
export declare const palaceEscapeCandidate: (
  captured: City,
  loser: Player,
  dependencies?: CapitalDependencies
) => City | null;
/**
 * Where a computer player whose capital was just taken moves its Palace, if it does (`city_capture_aftermath_palace_escape`):
 *  with more than 999 gold, to `palaceEscapeCandidate`'s city, and only above Prince, with more than 11 cities or more
 *  than 1999 gold. `null` when it doesn't. A person is asked instead (`lib/palaceEscapeOffer`).
 */
export declare const palaceEscape: (
  captured: City,
  loser: Player,
  dependencies?: CapitalDependencies
) => City | null;
/**
 * `captured`'s Palace may not escape: a computer player's civil war that couldn't break out has already chosen where
 *  the next one is built (`city_capture_aftermath` passes `city4`, and `city_capture_aftermath_palace_escape` offers no
 *  escape then). For the civil war's `Captured` rule to call before this package's escape rule runs.
 */
export declare const barPalaceEscape: (captured: City) => void;
/** Whether `captured`'s Palace may not escape (`barPalaceEscape`). */
export declare const palaceEscapeBarred: (captured: City) => boolean;
/** Moves `loser`'s Palace to `city` for `palaceEscapeCost` gold. */
export declare const escapeTo: (
  city: City,
  loser: Player,
  { playerTreasuryRegistry, ruleRegistry }?: CapitalDependencies
) => void;
