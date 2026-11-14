"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const source_1 = require("../../lib/source");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonders_1 = require("../../Wonders");
const PollutionDivisor_1 = require("@civ-clone/base-city-pollution/Rules/PollutionDivisor");
// OpenCiv2 `city_calc_shields_pollution` (richardpenman/civ2@49f26ec): a Hydro or Nuclear Plant (or the Hoover Dam)
//  halves the shields that count towards pollution, and a Recycling Center or a Solar Plant thirds them; the largest
//  counts.
const getRules = (registries = {}) => [
    [CityImprovements_1.HydroPlant, Wonders_1.HooverDam, 2],
    [CityImprovements_1.NuclearPlant, null, 2],
    [CityImprovements_1.RecyclingCenter, null, 3],
    [CityImprovements_1.SolarPlant, null, 3],
].map(([Improvement, WonderType, divisor]) => new PollutionDivisor_1.default(`civ2-city-improvement:city/pollution-divisor/${Improvement.name}`, new Criterion_1.default((city) => (0, source_1.hasEither)(city, Improvement, WonderType, registries)), new Effect_1.default(() => divisor)));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=pollution-divisor.js.map