"use strict";
// The ids of this package's rules that another package is expected to name, as a rule set that supersedes one does.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MELTDOWN_RULE = exports.COURTHOUSE_RULE = exports.POLLUTION_RULE = void 0;
/** A city of a person's may pollute a square around it each turn, as Civ2: no computer player's does. */
exports.POLLUTION_RULE = 'civ2-city-improvement:city/process-yield/pollution';
/** The Courthouse halves the corruption civ2-city's rule works out, before the trade is split. */
exports.COURTHOUSE_RULE = 'civ2-city-improvement:city/yield/courthouse';
/** A person's city in disorder with a Nuclear Plant may melt down, after its pollution roll. */
exports.MELTDOWN_RULE = 'civ2-city-improvement:city/process-yield/nuclear-meltdown';
//# sourceMappingURL=RuleIds.js.map