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
import { paysUpkeep, upkeep } from '../../lib/upkeep';
import City from '@civ-clone/core-city/City';
import Cost from '@civ-clone/core-city/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import { DEMOCRACY } from '@civ-clone/civ2-rules/data/governments';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Yield from '@civ-clone/core-yield/Yield';
import { contents } from '../../lib/content';
import governmentOf from '@civ-clone/civ2-city/lib/government';
import improvements from '../../data/improvements';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import maintenanceRules from '@civ-clone/base-city-improvement-rules/lib/maintenance';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface CostDependencies extends Registries {
  clientRegistry?: ClientRegistry;
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}

export const getRules = (dependencies: CostDependencies = {}): Cost[] => {
  const {
      clientRegistry = clientRegistryInstance,
      gameDifficultyRegistry = gameDifficultyRegistryInstance,
      playerGovernmentRegistry = playerGovernmentRegistryInstance,
    } = dependencies,
    registries = withDefaults(dependencies),
    upkeepOf =
      (Improvement: Function) =>
      (city: City): number =>
        upkeep(Improvement as any, city.player(), {
          ...registries,
          gameDifficultyRegistry,
          playerGovernmentRegistry,
        });

  return [
    // Upkeep (`lib/upkeep`), paid only by a person's cities and not under Anarchy (OpenCiv2
    //  `city_pay_improvement_upkeep`, richardpenman/civ2@49f26ec), and only where it's more than nothing, so the
    //  treasury's bankruptcy sale can't take an improvement that costs nothing (the Palace).
    ...improvements.flatMap(([Improvement]) =>
      maintenanceRules(
        [
          [
            Improvement,
            CityImprovementMaintenanceGold as any,
            upkeepOf(Improvement),
          ],
        ],
        { cityImprovementRegistry: registries.cityImprovementRegistry },
        {
          idPrefix: 'civ2-city-improvement',
          criteria: [
            new Criterion((city: City): boolean =>
              isHuman(city.player(), clientRegistry)
            ),
            new Criterion((city: City): boolean =>
              paysUpkeep(city.player(), playerGovernmentRegistry)
            ),
            new Criterion(
              (city: City): boolean => upkeepOf(Improvement)(city) > 0
            ),
          ],
        }
      )
    ),

    // The content citizens of the city's improvements (`lib/content`), after the luxuries and before civ2-city-happiness's
    //  martial law (3500), as `Low`.
    ...contents.map(
      (content) =>
        new Cost(
          `civ2-city-improvement:city/cost/content/${content.name}`,
          new Low(),
          new Criterion(
            (city: City): boolean => content(city, registries) !== null
          ),
          new Criterion(
            (city: City, yields: Yield[]): boolean =>
              reduceYield(yields, Unhappiness) > 0
          ),
          new Effect((city: City, yields: Yield[]): Yield => {
            const { source, value } = content(city, registries)!;

            return new CityImprovementContent(
              Math.min(value, reduceYield(yields, Unhappiness)),
              source
            );
          })
        )
    ),

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
