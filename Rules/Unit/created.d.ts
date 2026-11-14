import { Registries } from '../../lib/source';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitImprovementRegistry } from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Created from '@civ-clone/core-unit/Rules/Created';
export declare const getRules: (
  unitImprovementRegistry?: UnitImprovementRegistry,
  ruleRegistry?: RuleRegistry,
  registries?: Registries
) => Created[];
export default getRules;
