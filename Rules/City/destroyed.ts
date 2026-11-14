import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import { destroyedWithCityRule } from '@civ-clone/base-city-improvement-rules/lib/city';

export const getRules = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Destroyed[] => [
  destroyedWithCityRule(
    { cityImprovementRegistry },
    'civ2-city-improvement:city/destroyed/improvements'
  ),
];

export default getRules;
