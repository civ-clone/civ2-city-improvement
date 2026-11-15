import {
  Aqueduct,
  Bank,
  Courthouse,
  Factory,
  HydroPlant,
  Library,
  ManufacturingPlant,
  Marketplace,
  NuclearPlant,
  Palace,
  PowerPlant,
  ResearchLab,
  SewerSystem,
  SolarPlant,
  StockExchange,
  University,
} from './CityImprovements';
import {
  Condition,
  Requirement,
  table,
} from '@civ-clone/core-requirement/Requirement';
import Capitalization from '@civ-clone/base-city-improvement-capitalization/Capitalization';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Corporation } from '@civ-clone/civ2-science/Advances';
import improvements from './data/improvements';

// What Civilization II's city improvements need, and what stops a city building them (OpenCiv2 `src/auto/city.cpp`
//  `city_can_build_improvement`, richardpenman/civ2@49f26ec), as entries `Rules/City/build` makes its rules from.

/** The advance a city's player needs before it can build each improvement (@IMPROVE's fourth column). */
export const requiresAdvance: Requirement[] = table(
  'civ2-city-improvement:city/build/requires-advance',
  'requires',
  improvements
    .filter(([, , , Advance]) => Advance !== null)
    .map(([Improvement, , , Advance]) => [Improvement, Advance!])
);

/** Capitalization (@IMPROVE row 38) needs The Corporation. */
export const capitalizationRequires: Requirement[] = table(
  'civ2-city-improvement:city/build/requires-advance',
  'requires',
  [[Capitalization, Corporation]]
);

/** The improvements a city needs, any one of, before it can build each improvement. */
export const requiresImprovement: Requirement[] = table(
  'civ2-city-improvement:city/build/requires-improvement',
  'requires',
  [
    [Bank, Marketplace],
    [StockExchange, Bank],
    [University, Library],
    [ResearchLab, University],
    [SewerSystem, Aqueduct],
    [ManufacturingPlant, Factory],
    [PowerPlant, Factory, ManufacturingPlant],
    [HydroPlant, Factory, ManufacturingPlant],
    [NuclearPlant, Factory, ManufacturingPlant],
    [SolarPlant, Factory, ManufacturingPlant],
  ],
  { mode: 'any', range: 'city' }
);

/**
 * The improvements, any one of, that stop a city building each improvement. A plant isn't built beside a better one:
 *  Civ2 lets a Hydro Plant join a Nuclear Plant, but not the other way round, and nothing joins a Solar Plant.
 */
export const excludedBy: Requirement[] = table(
  'civ2-city-improvement:city/build/excluded-by',
  'excludedBy',
  [
    [Courthouse, Palace],
    [PowerPlant, HydroPlant, NuclearPlant, SolarPlant],
    [HydroPlant, SolarPlant],
    [NuclearPlant, HydroPlant, SolarPlant],
  ],
  { mode: 'any', range: 'city' }
);

/** A city without one of the improvement already, which `Rules/City/build`'s own rule decides. */
export const notInCity = new Condition('civ2-city-improvement:not-in-city');

/** An improvement is built once in each city. The rule is written by hand; this entry names it for the civilopedia. */
export const notBuilt = new Requirement({
  id: 'civ2-city-improvement:city/build/not-built',
  subject: CityImprovement,
  relation: 'requires',
  targets: [notInCity],
  range: 'city',
});

/** The entries `Rules/City/build`'s deriver makes rules from. */
export const buildRequirements: Requirement[] = [
  ...requiresAdvance,
  ...capitalizationRequires,
  ...requiresImprovement,
  ...excludedBy,
];

/** The entries that only describe: no rule is made from them. */
export const describedRequirements: Requirement[] = [notBuilt];

export default buildRequirements;
