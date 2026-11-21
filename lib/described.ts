import Criterion from '@civ-clone/core-rule/Criterion';
import Description, {
  EffectDescription,
} from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * `rule` again, saying what it does (`effects`, after anything it already says): a rule of the same class, with the same
 *  id and priority, that asks `rule` whether it applies and has it do what it does. For the rules a base package builds
 *  (`obsoleteRules`, `createdRules`), which take no `Description` of their own.
 */
export const described = <R extends Rule<any[], any>>(
  rule: R,
  ...effects: EffectDescription[]
): R => {
  const RuleType = rule.constructor as new (
    ...values: ConstructorParameters<typeof Rule>
  ) => R;

  return new RuleType(
    ...(rule.id() === null ? [] : [rule.id() as string]),
    rule.priority(),
    new Criterion((...args: any[]): boolean => rule.validate(...args)),
    new Effect((...args: any[]): any => rule.process(...args)),
    new Description(...rule.descriptions(), ...effects)
  );
};

export default described;
