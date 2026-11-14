import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { GrowthLimit } from '@civ-clone/base-city-growth-limit/lib/growthLimit';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
/**
 * Civilization II's size caps (OpenCiv2 `city_needed_size_improvement`, richardpenman/civ2@49f26ec): a city of @COSMIC's
 *  Aqueduct size (8) grows no larger without an Aqueduct, and one of its Sewer size (12) none without a Sewer System.
 */
export declare const growthLimits: GrowthLimit[];
/** What the city needs before it can grow any larger, or `null`. */
export declare const growthLimit: (
  cityGrowth: CityGrowth,
  cityImprovementRegistry?: CityImprovementRegistry
) => typeof CityImprovement | null;
export default growthLimit;
