import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  GLOBAL_WARMING_RULE,
  WARMED_TERRAIN_RULE,
  WARMING_LEVEL_RULE,
  WARMING_POLLUTION_RULE,
  WARMING_STRIKE_RULE,
  WARMING_TARGET_RULE,
  WARMING_WARNING_RULE,
} from '../../RuleIds';
import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import {
  aboveLevel,
  atLevel,
  stepToward,
} from '@civ-clone/base-global-warming/lib/level';
import {
  computerCityRadii,
  solarPlantCities,
  warmedTerrain,
} from '../../lib/globalWarming';
import {
  warmingComputerDivisor,
  warmingMaximum,
  warmingMinimum,
  warmingPerWarming,
  warmingPollutionFactor,
  warmingStep,
  warmingStrikeAboveLevel,
  warmingWarningLevel,
  warmingWarningPollutionAbove,
} from '../../data/rules';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Low } from '@civ-clone/core-rule/Priorities';
import { Pollution } from '@civ-clone/civ2-world/TileImprovements';
import Rule from '@civ-clone/core-rule/Rule';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import WarmedTerrain from '@civ-clone/base-global-warming/Rules/WarmedTerrain';
import WarmingLevel from '@civ-clone/base-global-warming/Rules/WarmingLevel';
import WarmingPollution from '@civ-clone/base-global-warming/Rules/WarmingPollution';
import WarmingStrike from '@civ-clone/base-global-warming/Rules/WarmingStrike';
import WarmingTarget from '@civ-clone/base-global-warming/Rules/WarmingTarget';
import WarmingWarning from '@civ-clone/base-global-warming/Rules/WarmingWarning';
import { discounted } from '@civ-clone/base-global-warming/lib/pollution';
import updateGlobalWarming from '@civ-clone/base-global-warming/lib/globalWarming';

export interface GlobalWarmingRuleDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  clientRegistry?: ClientRegistry;
  engine?: Engine;
  pendingEffectRegistry?: PendingEffectRegistry;
  ruleRegistry?: RuleRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
  turn?: Turn;
}

// Civilization II's global warming (OpenCiv2 `src/auto/game.cpp` `game_update_global_warming` 00486c2e, called from
//  `game_advance_turn` 00487371; `src/auto/map.cpp` `map_apply_global_warming` 004868fb; richardpenman/civ2@49f26ec), on
//  `base-global-warming`, one rule for each of its numbers. Only a person's cities pollute (`Rules/City/pollution`), as
//  in the original, so a game with no person never warms.
export const getRules = ({
  cityImprovementRegistry = cityImprovementRegistryInstance,
  cityRegistry = cityRegistryInstance,
  clientRegistry = clientRegistryInstance,
  engine = engineInstance,
  pendingEffectRegistry = pendingEffectRegistryInstance,
  ruleRegistry = ruleRegistryInstance,
  tileImprovementRegistry = tileImprovementRegistryInstance,
  turn = turnInstance,
}: GlobalWarmingRuleDependencies = {}): Rule<any, any>[] => [
  // `game_advance_turn` updates warming as each turn but the first ends, after the barbarians appear and before the
  //  power ranks: here at the start of every turn but the first, after the turn's other `Start` rules (`Low`).
  new Start(
    GLOBAL_WARMING_RULE,
    new Low(),
    new Criterion((turn: Turn): boolean => turn.value() > 1),
    new Effect((): void => {
      updateGlobalWarming({
        Pollution,
        engine,
        pendingEffectRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        turn,
        // The world a warming changes: the cities', or with none, the pollution's.
        world: () =>
          (
            cityRegistry.entries().find((city) => !city.destroyed()) ??
            tileImprovementRegistry
              .entries()
              .find((improvement) => improvement instanceof Pollution)
          )
            ?.tile()
            .map() ?? null,
      });
    })
  ),

  // `polluted − w + w / 2`: `w` counts a polluted square once for each computer player's city that has it in its radius.
  new WarmingPollution(
    WARMING_POLLUTION_RULE,
    new Effect((squares) =>
      discounted(
        computerCityRadii({ cityRegistry, clientRegistry }),
        warmingComputerDivisor
      )(squares)
    )
  ),

  new WarmingTarget(
    WARMING_TARGET_RULE,
    new Effect(
      (pollution: number, warmings: number): number =>
        warmingPollutionFactor * pollution -
        warmingPerWarming * warmings -
        solarPlantCities({ cityImprovementRegistry })
    )
  ),

  new WarmingLevel(
    WARMING_LEVEL_RULE,
    new Effect(stepToward(warmingStep, warmingMinimum, warmingMaximum))
  ),

  new WarmingWarning(
    WARMING_WARNING_RULE,
    new Effect(atLevel(warmingWarningLevel, warmingWarningPollutionAbove))
  ),

  new WarmingStrike(
    WARMING_STRIKE_RULE,
    new Effect(aboveLevel(warmingStrikeAboveLevel))
  ),

  new WarmedTerrain(WARMED_TERRAIN_RULE, new Effect(warmedTerrain)),
];

export default getRules;
