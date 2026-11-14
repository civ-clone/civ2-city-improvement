"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Yields_1 = require("../../Yields");
const CityImprovements_1 = require("../../CityImprovements");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const Grow_1 = require("@civ-clone/core-city-growth/Rules/Grow");
const Wonders_1 = require("../../Wonders");
const source_1 = require("../../lib/source");
const rules_1 = require("../../data/rules");
const growthLimit_1 = require("@civ-clone/base-city-growth-limit/lib/growthLimit");
const growthLimit_2 = require("../../lib/growthLimit");
// OpenCiv2 `src/auto/city.cpp` `city_process_food` (richardpenman/civ2@49f26ec), after civ2-city's own `Grow` rules
//  (`Normal`) have emptied the box and set the new size's cost, so these are `Low`, whatever order the packages load in: a Granary (or the Pyramids) leaves half a box for the new size, at @COSMIC's rows, whoever's
//  city it is; then a city past a size cap (`lib/growthLimit`) shrinks back, keeping that box, as Civ2's undoes the
//  growth after filling it.
const getRules = (registries = {}) => {
    const { cityImprovementRegistry } = (0, source_1.withDefaults)(registries);
    return [
        new Grow_1.default('civ2-city-improvement:city/grow/granary', new Low_1.default(), new Criterion_1.default((cityGrowth) => (0, source_1.hasEither)(cityGrowth.city(), CityImprovements_1.Granary, Wonders_1.Pyramids, registries)), new Effect_1.default((cityGrowth) => cityGrowth.add(new Yields_1.FoodStorage((cityGrowth.size() + 1) * rules_1.granaryRowsPerCitizen)))),
        new Grow_1.default('civ2-city-improvement:city/grow/size-limit', new Low_1.default(), new Criterion_1.default((cityGrowth) => {
            const limit = (0, growthLimit_1.growthLimit)(cityGrowth, growthLimit_2.growthLimits, cityImprovementRegistry);
            return limit !== null && cityGrowth.size() > limit[0];
        }), new Effect_1.default((cityGrowth) => {
            const [, Needs] = (0, growthLimit_1.growthLimit)(cityGrowth, growthLimit_2.growthLimits, cityImprovementRegistry);
            cityGrowth.shrink(Needs);
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=grow.js.map