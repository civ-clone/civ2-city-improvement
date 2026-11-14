import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Strength from '@civ-clone/core-unit/Rules/Strength';
export declare const getRules: (
  cityRegistry?: CityRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => Strength[];
export default getRules;
