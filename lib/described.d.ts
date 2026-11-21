import { EffectDescription } from '@civ-clone/core-rule/Description';
import Rule from '@civ-clone/core-rule/Rule';
/**
 * `rule` again, saying what it does (`effects`, after anything it already says): a rule of the same class, with the same
 *  id and priority, that asks `rule` whether it applies and has it do what it does. For the rules a base package builds
 *  (`obsoleteRules`, `createdRules`), which take no `Description` of their own.
 */
export declare const described: <R extends Rule<any[], any>>(
  rule: R,
  ...effects: EffectDescription[]
) => R;
export default described;
