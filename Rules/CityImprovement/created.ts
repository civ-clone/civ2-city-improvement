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
import described from '../../lib/described';

// A new improvement is registered; a new Palace moves the capital, destroying the player's old one; and the engine is
//  told. The move says so of the Palace.
export const getRules = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  engine: Engine = engineInstance
): Created[] =>
  createdRules(
    { cityImprovementRegistry, engine },
    { Capital: Palace, idPrefix: 'civ2-city-improvement' }
  ).map(
    (rule: Created): Created =>
      rule.id() ===
      'civ2-city-improvement:city-improvement/created/move-capital'
        ? described(rule, { type: 'relocates', subject: Palace })
        : rule
  );

export default getRules;
