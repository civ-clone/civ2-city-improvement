"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BuildCost_1 = require("@civ-clone/core-city-build/Rules/BuildCost");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const improvements_1 = require("../../data/improvements");
/** Each improvement's cost in shields: @IMPROVE's rows of shields, times @COSMIC's shield box rows (10). */
const getRules = () => improvements_1.default.flatMap(([Improvement, cost]) => (0, BuildCost_1.buildCost)(Improvement, cost * cosmic_1.default.shieldBoxRows, 'civ2-city-improvement:city/build-cost'));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-cost.js.map