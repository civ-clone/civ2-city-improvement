import {
  Automobile,
  Environmentalism,
  Industrialization,
  MassProduction,
  Plastics,
  Sanitation,
} from '@civ-clone/civ2-science/Advances';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { MassTransit, SolarPlant } from '../CityImprovements';
import { Production, UnitSupportProduction } from '../Yields';
import { Waste } from '@civ-clone/civ2-city/Yields';
import { Registries, withDefaults } from './source';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  populationPollution,
  productionPollution,
} from '@civ-clone/base-city-pollution/lib/pollution';
import {
  pollutionRollCeiling,
  pollutionTolerance,
  populationPollutionDivisor,
} from '../data/rules';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';

/** The advances that make a city's population pollute, one step each. */
export const pollutingAdvances = [
  Industrialization,
  Automobile,
  MassProduction,
  Plastics,
];

const has = (city: City, Improvement: Function, registries: Registries) =>
  improvementOf(
    city,
    Improvement as any,
    withDefaults(registries).cityImprovementRegistry
  ) !== null;

/**
 * How much a city's citizens pollute, a step each (OpenCiv2 `city_calc_shields_pollution`,
 *  richardpenman/civ2@49f26ec): one for each of `pollutingAdvances` its player knows, and then, if any, one more
 *  without Sanitation, one less with Environmentalism and one less with a Solar Plant; none with Mass Transit.
 */
export const populationFactor = (
  city: City,
  registries: Registries = {}
): number => {
  if (has(city, MassTransit, registries)) {
    return 0;
  }

  const research = withDefaults(registries).playerResearchRegistry.getByPlayer(
    city.player()
  );

  let factor = pollutingAdvances.filter((Advance) =>
    research.completed(Advance)
  ).length;

  if (factor !== 0 && !research.completed(Sanitation)) {
    factor++;
  }

  if (factor !== 0 && research.completed(Environmentalism)) {
    factor--;
  }

  if (factor !== 0 && has(city, SolarPlant, registries)) {
    factor--;
  }

  return factor;
};

/**
 * A city's pollution (`city_calc_shields_pollution`): its shields (after the Factory's and plants' bonuses, before unit
 *  support) over its `PollutionDivisor`, less 20, or nothing at all from shields with a Solar Plant; plus its size times
 *  `populationFactor` over 4. Only a value above 0 risks pollution.
 */
export const pollution = (
  city: City,
  cityYields: Yield[] = city.yields(),
  registries: Registries = {},
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): number =>
  (has(city, SolarPlant, registries)
    ? 0
    : productionPollution(
        city,
        cityYields,
        Production,
        // Before support and waste (`city_calc_shields_pollution` ~3435, which takes the waste off after).
        [UnitSupportProduction, Waste],
        ruleRegistry
      ) - pollutionTolerance) +
  populationPollution(
    city,
    populationFactor(city, registries),
    populationPollutionDivisor,
    cityGrowthRegistry
  );

/**
 * The size of a city's pollution roll (`city_process_pollution`): 256 less half its player's advances (counted from 1,
 *  as civ2-science counts them) times the level, that half halved while it's above 255 with a Solar Plant.
 */
export const rollRange =
  (level: () => number, registries: Registries = {}) =>
  (city: City): number => {
    const advances =
      withDefaults(registries)
        .playerResearchRegistry.getByPlayer(city.player())
        .complete().length + 1;

    let chance = (advances * level()) >> 1;

    if (has(city, SolarPlant, registries)) {
      while (chance > 255) {
        chance = Math.trunc(chance / 2);
      }
    }

    return pollutionRollCeiling - chance;
  };

export default pollution;
