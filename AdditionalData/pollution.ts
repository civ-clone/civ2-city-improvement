import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import City from '@civ-clone/core-city/City';
import { Registries } from '../lib/source';
import pollution from '../lib/pollution';

/** How much the city pollutes (`lib/pollution`), never below 0, for a renderer. */
export const getAdditionalData = (
  registries: Registries = {},
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
): AdditionalData[] => [
  new AdditionalData(City, 'pollution', (city: City): number =>
    Math.max(
      0,
      pollution(
        city,
        city.yields(),
        registries,
        ruleRegistry,
        cityGrowthRegistry
      )
    )
  ),
];

export default getAdditionalData;
