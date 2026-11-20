import { Corruption, Gold } from '../../Yields';
import { Courthouse, Palace } from '../../CityImprovements';
import {
  PlayerGovernmentRegistry,
  instance as playerGovernmentRegistryInstance,
} from '@civ-clone/core-government/PlayerGovernmentRegistry';
import { Registries, withDefaults } from '../../lib/source';
import City from '@civ-clone/core-city/City';
import { COURTHOUSE_RULE } from '../../RuleIds';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import { FUNDAMENTALISM } from '@civ-clone/civ2-rules/data/governments';
import { Fundamentalism } from '@civ-clone/civ2-city/Governments';
import { JsBachsCathedral } from '../../Wonders';
import Priority from '@civ-clone/core-rule/Priority';
import Yield from '@civ-clone/core-yield/Yield';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import { contentImprovements, tithes as cityTithes } from '../../lib/content';
import { courthouseCorruptionDivisor } from '../../data/rules';
import governmentOf from '@civ-clone/civ2-city/lib/government';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

export interface YieldDependencies extends Registries {
  playerGovernmentRegistry?: PlayerGovernmentRegistry;
}

// The Courthouse after civ2-city's corruption (`High`, 1000) and before civ2-trade-rate's split (`Normal`, 2000); the
//  tithes after the split. What the improvements add to each square is `Rules/City/tile-yield`'s.
const COURTHOUSE = 1500,
  TITHES = 2500;

export const getRules = (dependencies: YieldDependencies = {}): YieldRule[] => {
  const registries = withDefaults(dependencies),
    { playerGovernmentRegistry = playerGovernmentRegistryInstance } =
      dependencies,
    has = (city: City, Improvement: typeof CityImprovement): boolean =>
      improvementOf(city, Improvement, registries.cityImprovementRegistry) !==
      null,
    tithes = (city: City): number => cityTithes(city, registries);

  return [
    // `city_calc_corruption`: a Courthouse or the Palace halves the city's corruption, once, rounding what's left down.
    //  The Palace's halving is civ2-city's, so a Courthouse in the Palace's city (a capital moved or rebuilt there) adds
    //  nothing.
    new YieldRule(
      COURTHOUSE_RULE,
      new Priority(COURTHOUSE),
      new Criterion((city: City): boolean => has(city, Courthouse)),
      new Criterion((city: City): boolean => !has(city, Palace)),
      new Criterion(
        (city: City, yields: Yield[]): boolean =>
          reduceYield(yields, Corruption) < 0
      ),
      new Effect(
        (city: City, yields: Yield[]): Yield =>
          // Corruption is a negative yield: a negative value given back to it takes from what's lost.
          new Corruption(
            Math.floor(
              reduceYield(yields, Corruption) / courthouseCorruptionDivisor
            ),
            Courthouse.name
          )
      ),
      new Description({
        type: 'yield_percent',
        subject: Courthouse,
        yield: Corruption,
        value: -1 / courthouseCorruptionDivisor,
        of: 'total',
        notWith: [Palace],
      })
    ),

    // `city_split_trade`: under Fundamentalism the improvements' content citizens (and J. S. Bach's) are paid as tithes, in gold, before
    //  the Marketplace's bonus.
    new YieldRule(
      'civ2-city-improvement:city/yield/tithes',
      new Priority(TITHES),
      new Criterion(
        (city: City): boolean =>
          governmentOf(city.player(), playerGovernmentRegistry) ===
          FUNDAMENTALISM
      ),
      new Criterion((city: City): boolean => tithes(city) > 0),
      new Effect((city: City): Yield => new Gold(tithes(city), 'tithes')),
      new Description(
        ...contentImprovements.map((Improvement) => ({
          type: 'tithe',
          subject: Improvement,
          with: [Fundamentalism],
        })),
        {
          type: 'tithe',
          subject: JsBachsCathedral,
          with: [Fundamentalism],
          scope: 'player',
        }
      )
    ),
  ];
};

export default getRules;
