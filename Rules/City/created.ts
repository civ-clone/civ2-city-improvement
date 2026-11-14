import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Created from '@civ-clone/core-city/Rules/Created';
import { Palace } from '../../CityImprovements';
import { firstCapitalRule } from '@civ-clone/base-city-improvement-rules/lib/city';

// A civilization's first city gets the Palace (OpenCiv2 `src/auto/city.cpp` `city_create`, when the civilization's
//  city count is 1, richardpenman/civ2@49f26ec), and so does the first after it has lost them all.
export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Created[] => [
  firstCapitalRule(
    Palace,
    { cityRegistry, cityImprovementRegistry, ruleRegistry },
    'civ2-city-improvement:city/created/palace'
  ),
];

export default getRules;
