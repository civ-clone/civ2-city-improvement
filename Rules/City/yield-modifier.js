"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("../../Yields");
const source_1 = require("../../lib/source");
const bonus_1 = require("../../lib/bonus");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const YieldModifier_1 = require("@civ-clone/core-city/Rules/YieldModifier");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// Civilization II's improvements add shares of the city's base yields, never of each other's (OpenCiv2 `city_split_trade`
//  and `city_calc_shields_pollution`, richardpenman/civ2@49f26ec; `lib/bonus`).
const getRules = (dependencies = {}) => {
    const registries = (0, source_1.withDefaults)(dependencies);
    return [
        ...[Yields_1.Luxuries, Yields_1.Gold].map((YieldType) => new YieldModifier_1.default(`civ2-city-improvement:city/yield-modifier/market/${YieldType.name}`, new Low_1.default(), new Criterion_1.default((city) => (0, bonus_1.marketLevel)(city, registries) > 0), new Effect_1.default((city, yields, base) => new YieldType((Math.max((0, reduceYields_1.reduceYield)(base, YieldType), 0) *
            (0, bonus_1.marketLevel)(city, registries)) >>
            1, 'market')))),
        new YieldModifier_1.default('civ2-city-improvement:city/yield-modifier/science', new Low_1.default(), new Effect_1.default((city, yields, base) => new Yields_1.Research((0, bonus_1.scienceBonus)(city, Math.max((0, reduceYields_1.reduceYield)(base, Yields_1.Research), 0), registries), 'science'))),
        new YieldModifier_1.default('civ2-city-improvement:city/yield-modifier/production', new Low_1.default(), new Effect_1.default((city, yields, base) => new Yields_1.Production((0, bonus_1.productionBonus)(city, Math.max((0, reduceYields_1.reduceYield)(base, Yields_1.Production), 0), registries), 'factory'))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield-modifier.js.map