"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.divisors = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const source_1 = require("../../lib/source");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonders_1 = require("../../Wonders");
const PollutionDivisor_1 = require("@civ-clone/base-city-pollution/Rules/PollutionDivisor");
// OpenCiv2 `city_calc_shields_pollution` (richardpenman/civ2@49f26ec): a Hydro or Nuclear Plant (or the Hoover Dam)
//  halves the shields that count towards pollution, and a Recycling Center or a Solar Plant thirds them; the largest
//  counts.
//  A Solar Plant's row is said nowhere: it takes the shields out of the pollution altogether (`lib/pollution`), which
//  `Rules/City/pollution` says.
exports.divisors = [
    [CityImprovements_1.HydroPlant, Wonders_1.HooverDam, 2],
    [CityImprovements_1.NuclearPlant, null, 2],
    [CityImprovements_1.RecyclingCenter, null, 3],
    [CityImprovements_1.SolarPlant, null, 3],
];
const getRules = (registries = {}) => exports.divisors.map(([Improvement, WonderType, divisor]) => new PollutionDivisor_1.default(`civ2-city-improvement:city/pollution-divisor/${Improvement.name}`, new Criterion_1.default((city) => (0, source_1.hasEither)(city, Improvement, WonderType, registries)), new Effect_1.default(() => divisor), new Description_1.default(...(Improvement === CityImprovements_1.SolarPlant
    ? []
    : [
        {
            type: 'pollution_divisor',
            subject: Improvement,
            value: divisor,
            // The largest divisor counts.
            notWith: exports.divisors
                .map(([Other]) => Other)
                .filter((Other) => Other !== Improvement && Other !== CityImprovements_1.SolarPlant),
        },
    ]), ...(WonderType === null
    ? []
    : [
        {
            type: 'acts_as',
            subject: WonderType,
            improvement: Improvement,
            scope: 'player',
        },
    ]))));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=pollution-divisor.js.map