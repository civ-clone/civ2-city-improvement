import { Automobile } from '@civ-clone/civ2-science/Advances';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Registries } from './source';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import Yield from '@civ-clone/core-yield/Yield';
/** The advances that make a city's population pollute, one step each. */
export declare const pollutingAdvances: (typeof Automobile)[];
/**
 * How much a city's citizens pollute, a step each (OpenCiv2 `city_calc_shields_pollution`,
 *  richardpenman/civ2@49f26ec): one for each of `pollutingAdvances` its player knows, and then, if any, one more
 *  without Sanitation, one less with Environmentalism and one less with a Solar Plant; none with Mass Transit.
 */
export declare const populationFactor: (
  city: City,
  registries?: Registries
) => number;
/**
 * A city's pollution (`city_calc_shields_pollution`): its shields (after the Factory's and plants' bonuses, before unit
 *  support) over its `PollutionDivisor`, less 20, or nothing at all from shields with a Solar Plant; plus its size times
 *  `populationFactor` over 4. Only a value above 0 risks pollution.
 */
export declare const pollution: (
  city: City,
  cityYields?: Yield[],
  registries?: Registries,
  ruleRegistry?: RuleRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => number;
/**
 * The size of a city's pollution roll (`city_process_pollution`): 256 less half its player's advances (counted from 1,
 *  as civ2-science counts them) times the level, that half halved while it's above 255 with a Solar Plant.
 */
export declare const rollRange: (
  level: () => number,
  registries?: Registries
) => (city: City) => number;
export default pollution;
