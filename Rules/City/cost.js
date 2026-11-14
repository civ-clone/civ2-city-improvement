"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("../../Yields");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const CityImprovements_1 = require("../../CityImprovements");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const source_1 = require("../../lib/source");
const upkeep_1 = require("../../lib/upkeep");
const Cost_1 = require("@civ-clone/core-city/Rules/Cost");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const governments_1 = require("@civ-clone/civ2-rules/data/governments");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const content_1 = require("../../lib/content");
const government_1 = require("@civ-clone/civ2-city/lib/government");
const improvements_1 = require("../../data/improvements");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
/** Each improvement's @IMPROVE row, the order Civ2 pays upkeep in (`city_pay_improvement_upkeep`). */
const rowOf = new Map(improvements_1.default.map(([Improvement], index) => [Improvement, index]));
const getRules = (dependencies = {}) => {
    const { clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, } = dependencies, registries = (0, source_1.withDefaults)(dependencies), upkeepDependencies = {
        ...registries,
        gameDifficultyRegistry,
        playerGovernmentRegistry,
    };
    return [
        // Upkeep (`lib/upkeep`), paid only by a person's cities and not under Anarchy (OpenCiv2
        //  `city_pay_improvement_upkeep`, richardpenman/civ2@49f26ec), in @IMPROVE order, and only where it's more than
        //  nothing, so the treasury's bankruptcy sale can't take an improvement that costs nothing (the Palace). One rule
        //  that reads the city's improvements once.
        new Cost_1.default('civ2-city-improvement:city/cost/maintenance', new Criterion_1.default((city) => (0, isHuman_1.default)(city.player(), clientRegistry)), new Criterion_1.default((city) => (0, upkeep_1.paysUpkeep)(city.player(), playerGovernmentRegistry)), new Effect_1.default((city) => {
            const costOf = (0, upkeep_1.upkeepFor)(city.player(), upkeepDependencies);
            return registries.cityImprovementRegistry
                .getByCity(city)
                .filter((improvement) => rowOf.has(improvement.constructor))
                .sort((a, b) => rowOf.get(a.constructor) - rowOf.get(b.constructor))
                .flatMap((improvement) => {
                const cost = costOf(improvement.constructor);
                return cost > 0
                    ? [new Yields_1.CityImprovementMaintenanceGold(cost, improvement)]
                    : [];
            });
        })),
        // The content citizens of the city's improvements (`lib/content`), after the luxuries and before civ2-city-happiness's
        //  martial law (3500), as `Low`.
        ...content_1.contents.map((content) => {
            // Worked out once a `yields()` call, for the criterion and the effect both.
            const known = new WeakMap(), of = (city, yields) => {
                if (!known.has(yields)) {
                    known.set(yields, content(city, registries));
                }
                return known.get(yields);
            };
            return new Cost_1.default(`civ2-city-improvement:city/cost/content/${content.name}`, new Low_1.default(), new Criterion_1.default((city, yields) => of(city, yields) !== null), new Criterion_1.default((city, yields) => (0, reduceYields_1.reduceYield)(yields, Yields_1.Unhappiness) > 0), new Effect_1.default((city, yields) => {
                const { source, value } = of(city, yields);
                return new Yields_1.CityImprovementContent(Math.min(value, (0, reduceYields_1.reduceYield)(yields, Yields_1.Unhappiness)), source);
            }));
        }),
        // Under Democracy a Courthouse, or the Palace, makes one content citizen happy.
        new Cost_1.default('civ2-city-improvement:city/cost/courthouse-democracy', new Low_1.default(), new Criterion_1.default((city) => (0, government_1.default)(city.player(), playerGovernmentRegistry) === governments_1.DEMOCRACY), new Criterion_1.default((city) => (0, has_1.improvementOf)(city, CityImprovements_1.Courthouse, registries.cityImprovementRegistry) !== null ||
            (0, has_1.improvementOf)(city, CityImprovements_1.Palace, registries.cityImprovementRegistry) !==
                null), new Effect_1.default((city) => {
            var _a;
            return new Yields_1.Happiness(1, ((_a = (0, has_1.improvementOf)(city, CityImprovements_1.Courthouse, registries.cityImprovementRegistry)) !== null && _a !== void 0 ? _a : (0, has_1.improvementOf)(city, CityImprovements_1.Palace, registries.cityImprovementRegistry)).id());
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map