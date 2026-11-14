"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const growthLimit_1 = require("@civ-clone/base-city-growth-limit/lib/growthLimit");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const CityGrowth_1 = require("@civ-clone/core-city-growth/CityGrowth");
const growthLimit_2 = require("../lib/growthLimit");
/** What the city needs before it can grow past its size, for a renderer, or `null`. */
const getAdditionalData = (cityImprovementRegistry = CityImprovementRegistry_1.instance) => [
    new AdditionalData_1.default(CityGrowth_1.default, 'limit', (cityGrowth) => (0, growthLimit_1.growthLimitData)(cityGrowth, growthLimit_2.growthLimits, cityImprovementRegistry)),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=growthLimit.js.map