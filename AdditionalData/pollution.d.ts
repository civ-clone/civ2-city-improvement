import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import AdditionalData from '@civ-clone/core-data-object/AdditionalData';
import { Registries } from '../lib/source';
/** How much the city pollutes (`lib/pollution`), never below 0, for a renderer. */
export declare const getAdditionalData: (
  registries?: Registries,
  ruleRegistry?: RuleRegistry,
  cityGrowthRegistry?: CityGrowthRegistry
) => AdditionalData[];
export default getAdditionalData;
