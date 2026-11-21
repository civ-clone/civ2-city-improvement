"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.described = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/**
 * `rule` again, saying what it does (`effects`, after anything it already says): a rule of the same class, with the same
 *  id and priority, that asks `rule` whether it applies and has it do what it does. For the rules a base package builds
 *  (`obsoleteRules`, `createdRules`), which take no `Description` of their own.
 */
const described = (rule, ...effects) => {
    const RuleType = rule.constructor;
    return new RuleType(...(rule.id() === null ? [] : [rule.id()]), rule.priority(), new Criterion_1.default((...args) => rule.validate(...args)), new Effect_1.default((...args) => rule.process(...args)), new Description_1.default(...rule.descriptions(), ...effects));
};
exports.described = described;
exports.default = exports.described;
//# sourceMappingURL=described.js.map