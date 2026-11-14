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
/** `compute` worked out once for each `base` array (one `yields()` call), for a rule's criterion and effect both. */
const oncePerBase = (compute) => {
    const known = new WeakMap();
    return (city, base) => {
        if (!known.has(base)) {
            known.set(base, compute(city, base));
        }
        return known.get(base);
    };
};
const getRules = (dependencies = {}) => {
    const registries = (0, source_1.withDefaults)(dependencies), market = (YieldType) => oncePerBase((city, base) => {
        const amount = Math.max((0, reduceYields_1.reduceYield)(base, YieldType), 0);
        return amount === 0 ? 0 : (amount * (0, bonus_1.marketLevel)(city, registries)) >> 1;
    }), science = oncePerBase((city, base) => {
        const amount = Math.max((0, reduceYields_1.reduceYield)(base, Yields_1.Research), 0);
        return amount === 0 ? 0 : (0, bonus_1.scienceBonus)(city, amount, registries);
    }), production = oncePerBase((city, base) => (0, bonus_1.productionBonus)(city, Math.max((0, reduceYields_1.reduceYield)(base, Yields_1.Production), 0), registries)), modifier = (id, bonus, YieldType, provider) => new YieldModifier_1.default(id, new Low_1.default(), new Criterion_1.default((city, yields, base) => bonus(city, base) > 0), new Effect_1.default((city, yields, base) => new YieldType(bonus(city, base), provider)));
    return [
        ...[Yields_1.Luxuries, Yields_1.Gold].map((YieldType) => modifier(`civ2-city-improvement:city/yield-modifier/market/${YieldType.name}`, market(YieldType), YieldType, 'market')),
        modifier('civ2-city-improvement:city/yield-modifier/science', science, Yields_1.Research, 'science'),
        modifier('civ2-city-improvement:city/yield-modifier/production', production, Yields_1.Production, 'factory'),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield-modifier.js.map