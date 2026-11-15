import {
  Condition,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
/** The advance a city's player needs before it can build each improvement (@IMPROVE's fourth column). */
export declare const requiresAdvance: Requirement[];
/** Capitalization (@IMPROVE row 38) needs The Corporation. */
export declare const capitalizationRequires: Requirement[];
/** The improvements a city needs, any one of, before it can build each improvement. */
export declare const requiresImprovement: Requirement[];
/**
 * The improvements, any one of, that stop a city building each improvement. A plant isn't built beside a better one:
 *  Civ2 lets a Hydro Plant join a Nuclear Plant, but not the other way round, and nothing joins a Solar Plant.
 */
export declare const excludedBy: Requirement[];
/** A city without one of the improvement already, which `Rules/City/build`'s own rule decides. */
export declare const notInCity: Condition;
/** An improvement is built once in each city. The rule is written by hand; this entry names it for the civilopedia. */
export declare const notBuilt: Requirement;
/** The entries `Rules/City/build`'s deriver makes rules from. */
export declare const buildRequirements: Requirement[];
/** The entries that only describe: no rule is made from them. */
export declare const describedRequirements: Requirement[];
export default buildRequirements;
