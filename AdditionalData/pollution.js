"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdditionalData = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const AdditionalData_1 = require("@civ-clone/core-data-object/AdditionalData");
const City_1 = require("@civ-clone/core-city/City");
const pollution_1 = require("../lib/pollution");
/** How much the city pollutes (`lib/pollution`), never below 0, for a renderer. */
const getAdditionalData = (registries = {}, ruleRegistry = RuleRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => [
    new AdditionalData_1.default(City_1.default, 'pollution', (city) => Math.max(0, (0, pollution_1.default)(city, city.yields(), registries, ruleRegistry, cityGrowthRegistry))),
];
exports.getAdditionalData = getAdditionalData;
exports.default = exports.getAdditionalData;
//# sourceMappingURL=pollution.js.map