"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.palacePriority = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const buildPriority_1 = require("@civ-clone/base-city-improvement-rules/lib/buildPriority");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Yields_1 = require("../../Yields");
const upkeep_1 = require("../../lib/upkeep");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const rules_1 = require("../../data/rules");
const BuildPriority_1 = require("@civ-clone/core-city-build/Rules/BuildPriority");
const capital_1 = require("../../lib/capital");
/** How much a city with no capital in its player's empire wants the Palace back: above any other need but war. */
exports.palacePriority = 20;
// A city near a size cap wants the improvement that lifts it (sooner with food to spare).
const nearCap = (size) => ({ food, size: citySize }) => citySize >= size - 2
    ? (citySize - (size - 3)) * 2 + (food >= 4 ? 2 : 0)
    : food >= 4 && citySize >= size - 4
        ? 2
        : 0;
/**
 * A computer player's rules of thumb for which improvement a city builds, as civ1-city-improvement's (they follow the
 *  feel of the game, not its code) with Civilization II's size caps, and the Palace: a player that has lost its capital
 *  rebuilds it in its largest city, or corruption takes almost all of its trade (civ2-city).
 */
const getRules = (dependencies = {}) => {
    const { cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, } = dependencies, isLargest = (city) => {
        const size = (other) => cityGrowthRegistry.getByCity(other).size(), [largest] = cityRegistry
            .getByPlayer(city.player())
            .slice()
            .sort((a, b) => size(b) - size(a));
        return largest === city;
    };
    // A city on Auto is ranked by civ2-city's own scores (`civ2-city:city/build-priority/auto`,
    //  `city_choose_production_improvement_score`); these rules of thumb are for a computer player's own choice only.
    const notOnAuto = (rule) => new BuildPriority_1.default(rule.id(), rule.priority(), new Criterion_1.default((cityBuild) => !cityBuild.auto()), new Criterion_1.default((cityBuild, item, yields) => rule.validate(cityBuild, item, yields)), new Effect_1.default((cityBuild, item, yields) => rule.process(cityBuild, item, yields)));
    return (0, buildPriority_1.buildPriorityRules)('civ2-city-improvement', {
        needs: [
            [
                CityImprovements_1.Palace,
                ({ city }) => (0, capital_1.capitalOf)(city.player(), dependencies) === null && isLargest(city)
                    ? exports.palacePriority
                    : 0,
            ],
            [
                CityImprovements_1.Granary,
                ({ food, size }) => food < 0 ? 3 : food <= 1 && size >= 3 ? 1 : 0,
            ],
            [CityImprovements_1.Aqueduct, nearCap(rules_1.aqueductSize)],
            [CityImprovements_1.SewerSystem, nearCap(rules_1.sewerSize)],
            [
                CityImprovements_1.Temple,
                ({ size, unhappy }) => unhappy > 0 ? 2 + unhappy * 2 : size >= 5 ? 1 : 0,
            ],
            [CityImprovements_1.Colosseum, ({ unhappy }) => Math.max(0, unhappy - 2) * 2],
            [CityImprovements_1.Cathedral, ({ unhappy }) => Math.max(0, unhappy - 3) * 2],
            [CityImprovements_1.Marketplace, ({ gold, luxuries }) => (gold + luxuries) * 0.5],
            [CityImprovements_1.Library, ({ research }) => research * 0.5],
            [CityImprovements_1.Bank, ({ gold, luxuries }) => (gold + luxuries) * 0.3],
            [CityImprovements_1.University, ({ research }) => research * 0.3],
            [
                CityImprovements_1.Courthouse,
                ({ corruption }) => (corruption >= 2 ? corruption * 0.5 : 0),
            ],
            [
                CityImprovements_1.Factory,
                ({ production }) => (production >= 8 ? production * 0.25 : 0),
            ],
        ],
        everydayImprovements: [
            CityImprovements_1.Bank,
            CityImprovements_1.Courthouse,
            CityImprovements_1.Granary,
            CityImprovements_1.Library,
            CityImprovements_1.Marketplace,
            CityImprovements_1.Temple,
            CityImprovements_1.University,
        ],
        everyday: 0.1,
        withFactory: [
            [CityImprovements_1.ManufacturingPlant, 0.2],
            [CityImprovements_1.HydroPlant, 0.15],
            [CityImprovements_1.NuclearPlant, 0.15],
            [CityImprovements_1.PowerPlant, 0.15],
        ],
        factories: [CityImprovements_1.Factory, CityImprovements_1.ManufacturingPlant],
        forWar: [CityImprovements_1.Barracks, CityImprovements_1.CityWalls],
        warPriority: 100,
    }, { Corruption: Yields_1.Corruption, Food: Yields_1.Food, Gold: Yields_1.Gold, Luxuries: Yields_1.Luxuries, Production: Yields_1.Production, Research: Yields_1.Research, Unhappiness: Yields_1.Unhappiness }, (Improvement, player) => (0, upkeep_1.upkeep)(Improvement, player, dependencies), dependencies).map(notOnAuto);
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-priority.js.map