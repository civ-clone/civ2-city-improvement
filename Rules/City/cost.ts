import {
  CityImprovementContent,
  CityImprovementMaintenanceGold,
  Happiness,
  Unhappiness,
} from '../../Yields';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import { Courthouse, Palace } from '../../CityImprovements';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries, withDefaults } from '../../lib/source';
import { paysUpkeep, upkeepFor } from '../../lib/upkeep';
import City from '@civ-clone/core-city/City';
import Cost from '@civ-clone/core-city/Rules/Cost';
import MilitaryUnhappiness from '@civ-clone/base-city-yield-military-unhappiness/MilitaryUnhappiness';
import Criterion from '@civ-clone/core-rule/Criterion';
import { DEMOCRACY } from '@civ-clone/civ2-rules/data/governments';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Yield from '@civ-clone/core-yield/Yield';
import { Content, contents } from '../../lib/content';
import governmentOf from '@civ-clone/civ2-city/lib/government';
import improvements from '../../data/improvements';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface CostDependencies extends Registries {
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}

/**
 * The unhappy citizens the improvements can make content: all but those military unhappiness makes, which Civ2 adds
 *  after them (`city_calc_trade_happiness` stage 3), so they never calm it.
 */
const stageTwoUnhappy = (yields: Yield[]): number =>
  reduceYield(yields, Unhappiness) -
  reduceYield(yields, MilitaryUnhappiness as unknown as typeof Yield);

/** Each improvement's @IMPROVE row, the order Civ2 pays upkeep in (`city_pay_improvement_upkeep`). */
const rowOf = new Map<Function, number>(
  improvements.map(([Improvement], index) => [Improvement, index])
);

export const getRules = (dependencies: CostDependencies = {}): Cost[] => {
  const {
      clientRegistry = clientRegistryInstance,
      gameDifficultyRegistry = gameDifficultyRegistryInstance,
      playerGovernmentRegistry = playerGovernmentRegistryInstance,
    } = dependencies,
    registries = withDefaults(dependencies),
    upkeepDependencies = {
      ...registries,
      gameDifficultyRegistry,
      playerGovernmentRegistry,
    };

  return [
    // Upkeep (`lib/upkeep`), paid only by a person's cities and not under Anarchy (OpenCiv2
    //  `city_pay_improvement_upkeep`, richardpenman/civ2@49f26ec), in @IMPROVE order, and only where it's more than
    //  nothing, so the treasury's bankruptcy sale can't take an improvement that costs nothing (the Palace). One rule
    //  that reads the city's improvements once.
    new Cost(
      'civ2-city-improvement:city/cost/maintenance',
      new Criterion((city: City): boolean =>
        isHuman(city.player(), clientRegistry)
      ),
      new Criterion((city: City): boolean =>
        paysUpkeep(city.player(), playerGovernmentRegistry)
      ),
      new Effect((city: City): Yield[] => {
        const costOf = upkeepFor(city.player(), upkeepDependencies);

        return registries.cityImprovementRegistry
          .getByCity(city)
          .filter((improvement) => rowOf.has(improvement.constructor))
          .sort((a, b) => rowOf.get(a.constructor)! - rowOf.get(b.constructor)!)
          .flatMap((improvement): Yield[] => {
            const cost = costOf(improvement.constructor as any);

            return cost > 0
              ? [new CityImprovementMaintenanceGold(cost, improvement)]
              : [];
          });
      })
    ),

    // The content citizens of the city's improvements (`lib/content`), after the luxuries and before civ2-city-happiness's
    //  martial law (3500), as `Low`.
    ...contents.map((content) => {
      // Worked out once a `yields()` call, for the criterion and the effect both.
      const known = new WeakMap<Yield[], Content | null>(),
        of = (city: City, yields: Yield[]): Content | null => {
          if (!known.has(yields)) {
            known.set(yields, content(city, registries));
          }

          return known.get(yields)!;
        };

      return new Cost(
        `civ2-city-improvement:city/cost/content/${content.name}`,
        new Low(),
        new Criterion(
          (city: City, yields: Yield[]): boolean => of(city, yields) !== null
        ),
        new Criterion(
          (city: City, yields: Yield[]): boolean => stageTwoUnhappy(yields) > 0
        ),
        new Effect((city: City, yields: Yield[]): Yield => {
          const { source, value } = of(city, yields)!;

          return new CityImprovementContent(
            Math.min(value, stageTwoUnhappy(yields)),
            source
          );
        })
      );
    }),

    // Under Democracy a Courthouse, or the Palace, makes one content citizen happy.
    new Cost(
      'civ2-city-improvement:city/cost/courthouse-democracy',
      new Low(),
      new Criterion(
        (city: City): boolean =>
          governmentOf(city.player(), playerGovernmentRegistry) === DEMOCRACY
      ),
      new Criterion(
        (city: City): boolean =>
          improvementOf(
            city,
            Courthouse,
            registries.cityImprovementRegistry
          ) !== null ||
          improvementOf(city, Palace, registries.cityImprovementRegistry) !==
            null
      ),
      new Effect(
        (city: City): Yield =>
          new Happiness(
            1,
            (improvementOf(
              city,
              Courthouse,
              registries.cityImprovementRegistry
            ) ??
              improvementOf(
                city,
                Palace,
                registries.cityImprovementRegistry
              ))!.id()
          )
      )
    ),
  ];
};

export default getRules;
