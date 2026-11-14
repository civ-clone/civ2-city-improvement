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
  factoryQuarters,
  manufacturingPlantQuarters,
  plantQuarters,
} from '../data/rules';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Wonder from '@civ-clone/core-wonder/Wonder';

const level = (
  city: City,
  sources: [typeof CityImprovement, typeof Wonder | null][],
  registries: Registries
): number =>
  sources.filter(([Improvement, WonderType]) =>
    hasEither(city, Improvement, WonderType, registries)
  ).length;

/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
export const marketLevel = (city: City, registries: Registries = {}): number =>
  level(
    city,
    [
      [Marketplace, null],
      [Bank, null],
      [StockExchange, null],
    ],
    registries
  );

/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
export const scienceLevel = (city: City, registries: Registries = {}): number =>
  level(
    city,
    [
      [Library, null],
      [University, null],
      [ResearchLab, SetiProgram],
    ],
    registries
  );

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

  return newton ? bonus : bonus >> 1;
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
  const factory =
    (hasEither(city, Factory, null, registries) ? factoryQuarters : 0) +
    (hasEither(city, ManufacturingPlant, null, registries)
      ? manufacturingPlantQuarters
      : 0);

  // No plant counts without a factory, so the plants aren't asked about then.
  if (factory === 0 || shields === 0) {
    return 0;
  }

  const plant = (
    [
      [PowerPlant, null],
      [HydroPlant, HooverDam],
      [NuclearPlant, null],
      [SolarPlant, null],
    ] as [typeof CityImprovement, typeof Wonder | null][]
  ).some(([Improvement, WonderType]) =>
    hasEither(city, Improvement, WonderType, registries)
  )
    ? plantQuarters
    : 0;

  return (
    ((shields * factory) >> 2) + ((shields * Math.min(plant, factory)) >> 2)
  );
};
