import { Registries } from './source';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Wonder from '@civ-clone/core-wonder/Wonder';
/** An improvement, and the Wonder that acts as it in every city of its owner (`null`: none). */
export type Source = [typeof CityImprovement, typeof Wonder | null];
/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
export declare const marketSources: Source[];
/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
export declare const scienceSources: Source[];
/** `city_calc_shields_pollution`: the quarters of the shields a Factory and a Manufacturing Plant each add. */
export declare const factorySources: [typeof CityImprovement, number][];
/** `city_calc_shields_pollution`: the plants (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam). */
export declare const plantSources: Source[];
/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
export declare const marketLevel: (
  city: City,
  registries?: Registries
) => number;
/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
export declare const scienceLevel: (
  city: City,
  registries?: Registries
) => number;
/** `city_split_trade`: a city's science bonus, `science × level ÷ 2`, but not halved in Isaac Newton's city. */
export declare const scienceBonus: (
  city: City,
  science: number,
  registries?: Registries
) => number;
/**
 * `city_calc_shields_pollution`: the shields added: the quarters of `shields` its Factory and Manufacturing Plant add, and a
 *  plant's (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam) no more than they do, each rounded down.
 */
export declare const productionBonus: (
  city: City,
  shields: number,
  registries?: Registries
) => number;
