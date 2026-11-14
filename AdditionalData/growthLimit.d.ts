import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
/** What the city needs before it can grow past its size, for a renderer, or `null`. */
export declare const getAdditionalData: (
  cityImprovementRegistry?: CityImprovementRegistry
) => AdditionalData[];
export default getAdditionalData;
