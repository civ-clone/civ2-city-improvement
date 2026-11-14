import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  GrowthLimitData,
  growthLimitData,
} from '@civ-clone/base-city-growth-limit/lib/growthLimit';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import { growthLimits } from '../lib/growthLimit';

/** What the city needs before it can grow past its size, for a renderer, or `null`. */
export const getAdditionalData = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): AdditionalData[] => [
  new AdditionalData(
    CityGrowth,
    'limit',
    (cityGrowth: CityGrowth): GrowthLimitData | null =>
      growthLimitData(cityGrowth, growthLimits, cityImprovementRegistry)
  ),
];

export default getAdditionalData;
