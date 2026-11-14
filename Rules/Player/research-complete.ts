import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import { Gunpowder, MobileWarfare } from '@civ-clone/civ2-science/Advances';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { Barracks } from '../../CityImprovements';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Complete from '@civ-clone/core-science/Rules/Complete';
import { Gold } from '../../Yields';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import improvements from '../../data/improvements';
import obsoleteRules from '@civ-clone/base-city-improvement-rules/lib/obsolete';

const costOf = (Improvement: typeof CityImprovement): number =>
  (improvements.find(([Type]) => Type === Improvement)?.[1] ?? 0) *
  cosmic.shieldBoxRows;

// Discovering Gunpowder or Mobile Warfare sells every one of the player's Barracks, for their cost in shields, 1 gold
//  each (OpenCiv2 `src/auto/civ.cpp` `civ_advance_sell_barracks`, richardpenman/civ2@49f26ec). They can be built again,
//  at a higher upkeep (`lib/upkeep`).
export const getRules = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  cityRegistry: CityRegistry = cityRegistryInstance,
  engine: Engine = engineInstance,
  playerTreasuryRegistry: PlayerTreasuryRegistry = playerTreasuryRegistryInstance
): Complete[] =>
  obsoleteRules(
    [
      [Barracks, Gunpowder],
      [Barracks, MobileWarfare],
    ],
    { cityImprovementRegistry, cityRegistry, engine },
    {
      idPrefix: 'civ2-city-improvement',
      removed: (
        player: Player,
        Improvement: typeof CityImprovement,
        obsolete: CityImprovement[]
      ): void => {
        if (obsolete.length === 0) {
          return;
        }

        playerTreasuryRegistry
          .getByPlayer(player)
          .find(
            (treasury: PlayerTreasury): boolean => treasury.yield() === Gold
          )
          ?.add(costOf(Improvement) * obsolete.length);
      },
    }
  );

export default getRules;
