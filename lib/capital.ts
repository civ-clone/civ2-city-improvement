import {
  CityWalls,
  Palace,
  SamMissileBattery,
  SdiDefence,
} from '../CityImprovements';
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
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { Registries, hasEither, withDefaults } from './source';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import {
  palaceEscapeAboveLevel,
  palaceEscapeCities,
  palaceEscapeCost,
  palaceEscapeGold,
  palaceEscapeMinimumSize,
} from '../data/rules';
import City from '@civ-clone/core-city/City';
import { Gold } from '../Yields';
import { GreatWall } from '../Wonders';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Unit from '@civ-clone/core-unit/Unit';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';

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
export const capitalOf = (
  player: Player,
  { cityImprovementRegistry }: Registries = {}
): City | null =>
  withDefaults({ cityImprovementRegistry })
    .cityImprovementRegistry.getByType(Palace)
    .find((palace) => palace.city().player() === player)
    ?.city() ?? null;

const goldTreasury = (
  player: Player,
  playerTreasuryRegistry: PlayerTreasuryRegistry
): PlayerTreasury | undefined =>
  playerTreasuryRegistry
    .getByPlayer(player)
    .find((treasury: PlayerTreasury): boolean => treasury.yield() === Gold);

/**
 * Where a computer player whose capital was just taken moves its Palace, if it does (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape`, richardpenman/civ2@49f26ec): only above Prince, with more than 999 gold, and
 *  more than 11 cities or more than 1999 gold, into its best city of size 8 or more and at least half the captured
 *  city's size. A city scores 3 a citizen, less its distance from the captured city, plus 4 for each point of defence
 *  on its square; × 1.5 with a SAM Missile Battery, × 2 with City Walls (or the Great Wall) and × 3 with an SDI Defense.
 *  `null` when it doesn't.
 */
export const palaceEscape = (
  captured: City,
  loser: Player,
  dependencies: CapitalDependencies = {}
): City | null => {
  const {
      cityGrowthRegistry = cityGrowthRegistryInstance,
      cityRegistry = cityRegistryInstance,
      clientRegistry = clientRegistryInstance,
      gameDifficultyRegistry = gameDifficultyRegistryInstance,
      playerTreasuryRegistry = playerTreasuryRegistryInstance,
      unitRegistry = unitRegistryInstance,
    } = dependencies,
    registries = withDefaults(dependencies),
    treasury = goldTreasury(loser, playerTreasuryRegistry),
    gold = treasury?.value() ?? 0,
    cities = cityRegistry
      .getByPlayer(loser)
      .filter((city: City): boolean => city !== captured);

  if (
    isHuman(loser, clientRegistry) ||
    levelOf(gameDifficultyRegistry) <= palaceEscapeAboveLevel ||
    gold < palaceEscapeCost ||
    !(cities.length > palaceEscapeCities || gold > palaceEscapeGold)
  ) {
    return null;
  }

  const size = (city: City): number =>
      cityGrowthRegistry.getByCity(city).size(),
    capturedSize = size(captured);

  let best: City | null = null,
    bestScore = -Infinity;

  cities
    .filter(
      (city: City): boolean =>
        size(city) >= palaceEscapeMinimumSize &&
        size(city) >= Math.trunc(capturedSize / 2)
    )
    .forEach((city: City): void => {
      let score =
        size(city) * 3 -
        Math.round(city.tile().distanceFrom(captured.tile())) +
        unitRegistry
          .getByTile(city.tile())
          .reduce(
            (total: number, unit: Unit): number =>
              total + unit.defence().value(),
            0
          ) *
          4;

      if (
        improvementOf(
          city,
          SamMissileBattery,
          registries.cityImprovementRegistry
        )
      ) {
        score = (score * 3) / 2;
      }

      if (hasEither(city, CityWalls, GreatWall, registries)) {
        score *= 2;
      }

      if (improvementOf(city, SdiDefence, registries.cityImprovementRegistry)) {
        score *= 3;
      }

      if (score > bestScore) {
        bestScore = score;
        best = city;
      }
    });

  return best;
};

/** Moves `loser`'s Palace to `city` for `palaceEscapeCost` gold. */
export const escapeTo = (
  city: City,
  loser: Player,
  {
    playerTreasuryRegistry = playerTreasuryRegistryInstance,
    ruleRegistry = ruleRegistryInstance,
  }: CapitalDependencies = {}
): void => {
  goldTreasury(loser, playerTreasuryRegistry)?.subtract(palaceEscapeCost);

  // Building it processes `Created`, which registers it and destroys any other of the player's.
  new Palace(city, ruleRegistry);
};
