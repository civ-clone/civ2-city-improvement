"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("../../Yields");
const CityImprovements_1 = require("../../CityImprovements");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const source_1 = require("../../lib/source");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const governments_1 = require("@civ-clone/civ2-rules/data/governments");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const content_1 = require("../../lib/content");
const government_1 = require("@civ-clone/civ2-city/lib/government");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// The Courthouse after civ2-city's corruption (`High`, 1000) and before civ2-trade-rate's split (`Normal`, 2000); the
//  tithes after the split. What the improvements add to each square is `Rules/City/tile-yield`'s.
const COURTHOUSE = 1500, TITHES = 2500;
const getRules = (dependencies = {}) => {
    const registries = (0, source_1.withDefaults)(dependencies), { playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance } = dependencies, has = (city, Improvement) => (0, has_1.improvementOf)(city, Improvement, registries.cityImprovementRegistry) !==
        null, tithes = (city) => (0, content_1.tithes)(city, registries);
    return [
        // `city_calc_corruption`: a Courthouse or the Palace halves the city's corruption, once, rounding what's left down.
        //  The Palace's halving is civ2-city's, so a Courthouse in the Palace's city (a capital moved or rebuilt there) adds
        //  nothing.
        new Yield_1.default(RuleIds_1.COURTHOUSE_RULE, new Priority_1.default(COURTHOUSE), new Criterion_1.default((city) => has(city, CityImprovements_1.Courthouse)), new Criterion_1.default((city) => !has(city, CityImprovements_1.Palace)), new Criterion_1.default((city, yields) => (0, reduceYields_1.reduceYield)(yields, Yields_1.Corruption) < 0), new Effect_1.default((city, yields) => 
        // Corruption is a negative yield: a negative value given back to it takes from what's lost.
        new Yields_1.Corruption(Math.floor((0, reduceYields_1.reduceYield)(yields, Yields_1.Corruption) / 2), CityImprovements_1.Courthouse.name))),
        // `city_split_trade`: under Fundamentalism the improvements' content citizens (and J. S. Bach's) are paid as tithes, in gold, before
        //  the Marketplace's bonus.
        new Yield_1.default('civ2-city-improvement:city/yield/tithes', new Priority_1.default(TITHES), new Criterion_1.default((city) => (0, government_1.default)(city.player(), playerGovernmentRegistry) ===
            governments_1.FUNDAMENTALISM), new Criterion_1.default((city) => tithes(city) > 0), new Effect_1.default((city) => new Yields_1.Gold(tithes(city), 'tithes'))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map