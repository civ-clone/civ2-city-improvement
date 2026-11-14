"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const CityImprovements_1 = require("../../CityImprovements");
const city_1 = require("@civ-clone/base-city-improvement-rules/lib/city");
// A civilization's first city gets the Palace (OpenCiv2 `src/auto/city.cpp` `city_create`, when the civilization's
//  city count is 1, richardpenman/civ2@49f26ec), and so does the first after it has lost them all.
const getRules = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => [
    (0, city_1.firstCapitalRule)(CityImprovements_1.Palace, { cityRegistry, cityImprovementRegistry, ruleRegistry }, 'civ2-city-improvement:city/created/palace'),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map