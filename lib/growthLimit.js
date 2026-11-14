"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.growthLimit = exports.growthLimits = void 0;
const CityImprovements_1 = require("../CityImprovements");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const growthLimit_1 = require("@civ-clone/base-city-growth-limit/lib/growthLimit");
const rules_1 = require("../data/rules");
/**
 * Civilization II's size caps (OpenCiv2 `city_needed_size_improvement`, richardpenman/civ2@49f26ec): a city of @COSMIC's
 *  Aqueduct size (8) grows no larger without an Aqueduct, and one of its Sewer size (12) none without a Sewer System.
 */
exports.growthLimits = [
    [rules_1.aqueductSize, CityImprovements_1.Aqueduct],
    [rules_1.sewerSize, CityImprovements_1.SewerSystem],
];
/** What the city needs before it can grow any larger, or `null`. */
const growthLimit = (cityGrowth, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    var _a, _b;
    return (_b = (_a = (0, growthLimit_1.growthLimit)(cityGrowth, exports.growthLimits, cityImprovementRegistry)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
};
exports.growthLimit = growthLimit;
exports.default = exports.growthLimit;
//# sourceMappingURL=growthLimit.js.map