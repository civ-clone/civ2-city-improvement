import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Created from '@civ-clone/core-city-improvement/Rules/Created';
import { Palace } from '../../CityImprovements';
import createdRules from '@civ-clone/base-city-improvement-rules/lib/created';

// A new improvement is registered; a new Palace moves the capital, destroying the player's old one; and the engine is
//  told.
export const getRules = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  engine: Engine = engineInstance
): Created[] =>
  createdRules(
    { cityImprovementRegistry, engine },
    { Capital: Palace, idPrefix: 'civ2-city-improvement' }
  );

export default getRules;
