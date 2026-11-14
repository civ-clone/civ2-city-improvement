import {
  ANARCHY,
  FUNDAMENTALISM,
} from '@civ-clone/civ2-rules/data/governments';
import { Barracks, Cathedral, Colosseum, Temple } from '../CityImprovements';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { Gunpowder, MobileWarfare } from '@civ-clone/civ2-science/Advances';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries, owns, withDefaults } from './source';
import { AdamSmithsTradingCompany } from '../Wonders';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import { barracksPrinceLevel } from '../data/rules';
import governmentOf from '@civ-clone/civ2-city/lib/government';
import improvements from '../data/improvements';
import { levelOf } from '@civ-clone/civ2-difficulty/level';

export interface UpkeepDependencies extends Registries {
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}

const rowUpkeep = new Map<Function, number>(
  improvements.map(([Improvement, , upkeep]) => [Improvement, upkeep])
);

/** The improvements Fundamentalism keeps for nothing. */
export const freeUnderFundamentalism: (typeof CityImprovement)[] = [
  Temple,
  Colosseum,
  Cathedral,
];

/**
 * What `Improvement` costs `player` in gold a turn (OpenCiv2 `src/auto/civ.cpp` `civ_improvement_upkeep`,
 *  richardpenman/civ2@49f26ec): its @IMPROVE upkeep; Barracks 1 less below Prince, 1 more with Gunpowder and 1 more
 *  with Mobile Warfare; nothing for an upkeep of 1 with Adam Smith's; and nothing for a Temple, Colosseum or Cathedral
 *  under Fundamentalism.
 */
export const upkeep = (
  Improvement: typeof CityImprovement,
  player: Player,
  {
    gameDifficultyRegistry = gameDifficultyRegistryInstance,
    playerGovernmentRegistry = playerGovernmentRegistryInstance,
    ...registries
  }: UpkeepDependencies = {}
): number => {
  let cost = rowUpkeep.get(Improvement) ?? 0;

  if (Improvement === Barracks) {
    const research =
      withDefaults(registries).playerResearchRegistry.getByPlayer(player);

    if (levelOf(gameDifficultyRegistry) < barracksPrinceLevel && cost !== 0) {
      cost--;
    }

    if (research.completed(Gunpowder)) {
      cost++;
    }

    if (research.completed(MobileWarfare)) {
      cost++;
    }
  }

  if (cost === 1 && owns(player, AdamSmithsTradingCompany, registries)) {
    cost = 0;
  }

  if (
    cost !== 0 &&
    freeUnderFundamentalism.includes(Improvement) &&
    governmentOf(player, playerGovernmentRegistry) === FUNDAMENTALISM
  ) {
    cost = 0;
  }

  return cost;
};

/** Whether `player`'s cities pay upkeep at all: not under Anarchy (OpenCiv2 `city_pay_improvement_upkeep`). */
export const paysUpkeep = (
  player: Player,
  playerGovernmentRegistry: PlayerGovernmentRegistry = playerGovernmentRegistryInstance
): boolean => governmentOf(player, playerGovernmentRegistry) !== ANARCHY;

export default upkeep;
