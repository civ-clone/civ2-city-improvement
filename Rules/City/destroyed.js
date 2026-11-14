"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const city_1 = require("@civ-clone/base-city-improvement-rules/lib/city");
const getRules = (cityImprovementRegistry = CityImprovementRegistry_1.instance) => [
    (0, city_1.destroyedWithCityRule)({ cityImprovementRegistry }, 'civ2-city-improvement:city/destroyed/improvements'),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map