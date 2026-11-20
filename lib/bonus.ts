import {
  Bank,
  Factory,
  HydroPlant,
  Library,
  ManufacturingPlant,
  Marketplace,
  NuclearPlant,
  PowerPlant,
  ResearchLab,
  SolarPlant,
  StockExchange,
  University,
} from '../CityImprovements';
import { HooverDam, IsaacNewtonsCollege, SetiProgram } from '../Wonders';
import { Registries, hasEither, withDefaults } from './source';
import {
  cityBonusShift,
  factoryQuarters,
  manufacturingPlantQuarters,
  plantQuarters,
} from '../data/rules';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Wonder from '@civ-clone/core-wonder/Wonder';

/** An improvement, and the Wonder that acts as it in every city of its owner (`null`: none). */
export type Source = [typeof CityImprovement, typeof Wonder | null];

const level = (city: City, sources: Source[], registries: Registries): number =>
  sources.filter(([Improvement, WonderType]) =>
    hasEither(city, Improvement, WonderType, registries)
  ).length;

/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
export const marketSources: Source[] = [
  [Marketplace, null],
  [Bank, null],
  [StockExchange, null],
];

/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
export const scienceSources: Source[] = [
  [Library, null],
  [University, null],
  [ResearchLab, SetiProgram],
];

/** `city_calc_shields_pollution`: the quarters of the shields a Factory and a Manufacturing Plant each add. */
export const factorySources: [typeof CityImprovement, number][] = [
  [Factory, factoryQuarters],
  [ManufacturingPlant, manufacturingPlantQuarters],
];

/** `city_calc_shields_pollution`: the plants (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam). */
export const plantSources: Source[] = [
  [PowerPlant, null],
  [HydroPlant, HooverDam],
  [NuclearPlant, null],
  [SolarPlant, null],
];

/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
export const marketLevel = (city: City, registries: Registries = {}): number =>
  level(city, marketSources, registries);

/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
export const scienceLevel = (city: City, registries: Registries = {}): number =>
  level(city, scienceSources, registries);

/** `city_split_trade`: a city's science bonus, `science × level ÷ 2`, but not halved in Isaac Newton's city. */
export const scienceBonus = (
  city: City,
  science: number,
  registries: Registries = {}
): number => {
  const bonus = science * scienceLevel(city, registries),
    newton = withDefaults(registries)
      .wonderRegistry.getByCity(city)
      .some((wonder) => wonder instanceof IsaacNewtonsCollege);

  return newton ? bonus : bonus >> cityBonusShift;
};

/**
 * `city_calc_shields_pollution`: the shields added: the quarters of `shields` its Factory and Manufacturing Plant add, and a
 *  plant's (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam) no more than they do, each rounded down.
 */
export const productionBonus = (
  city: City,
  shields: number,
  registries: Registries = {}
): number => {
  const factory = factorySources.reduce(
    (total: number, [Improvement, quarters]): number =>
      total + (hasEither(city, Improvement, null, registries) ? quarters : 0),
    0
  );

  // No plant counts without a factory, so the plants aren't asked about then.
  if (factory === 0 || shields === 0) {
    return 0;
  }

  const plant = plantSources.some(([Improvement, WonderType]) =>
    hasEither(city, Improvement, WonderType, registries)
  )
    ? plantQuarters
    : 0;

  return (
    ((shields * factory) >> 2) + ((shields * Math.min(plant, factory)) >> 2)
  );
};
