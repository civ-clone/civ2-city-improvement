import { Aqueduct, SewerSystem } from '../CityImprovements';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  GrowthLimit,
  growthLimit as reachedGrowthLimit,
} from '@civ-clone/base-city-growth-limit/lib/growthLimit';
import { aqueductSize, sewerSize } from '../data/rules';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

/**
 * Civilization II's size caps (OpenCiv2 `city_needed_size_improvement`, richardpenman/civ2@49f26ec): a city of @COSMIC's
 *  Aqueduct size (8) grows no larger without an Aqueduct, and one of its Sewer size (12) none without a Sewer System.
 */
export const growthLimits: GrowthLimit[] = [
  [aqueductSize, Aqueduct],
  [sewerSize, SewerSystem],
];

/** What the city needs before it can grow any larger, or `null`. */
export const growthLimit = (
  cityGrowth: CityGrowth,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): typeof CityImprovement | null =>
  reachedGrowthLimit(cityGrowth, growthLimits, cityImprovementRegistry)?.[1] ??
  null;

export default growthLimit;
