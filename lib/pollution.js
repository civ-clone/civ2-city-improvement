"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollRange = exports.pollution = exports.populationFactor = exports.pollutingAdvances = void 0;
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovements_1 = require("../CityImprovements");
const Yields_1 = require("../Yields");
const source_1 = require("./source");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const pollution_1 = require("@civ-clone/base-city-pollution/lib/pollution");
const rules_1 = require("../data/rules");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
/** The advances that make a city's population pollute, one step each. */
exports.pollutingAdvances = [
    Advances_1.Industrialization,
    Advances_1.Automobile,
    Advances_1.MassProduction,
    Advances_1.Plastics,
];
const has = (city, Improvement, registries) => (0, has_1.improvementOf)(city, Improvement, (0, source_1.withDefaults)(registries).cityImprovementRegistry) !== null;
/**
 * How much a city's citizens pollute, a step each (OpenCiv2 `city_calc_shields_pollution`,
 *  richardpenman/civ2@49f26ec): one for each of `pollutingAdvances` its player knows, and then, if any, one more
 *  without Sanitation, one less with Environmentalism and one less with a Solar Plant; none with Mass Transit.
 */
const populationFactor = (city, registries = {}) => {
    if (has(city, CityImprovements_1.MassTransit, registries)) {
        return 0;
    }
    const research = (0, source_1.withDefaults)(registries).playerResearchRegistry.getByPlayer(city.player());
    let factor = exports.pollutingAdvances.filter((Advance) => research.completed(Advance)).length;
    if (factor !== 0 && !research.completed(Advances_1.Sanitation)) {
        factor++;
    }
    if (factor !== 0 && research.completed(Advances_1.Environmentalism)) {
        factor--;
    }
    if (factor !== 0 && has(city, CityImprovements_1.SolarPlant, registries)) {
        factor--;
    }
    return factor;
};
exports.populationFactor = populationFactor;
/**
 * A city's pollution (`city_calc_shields_pollution`): its shields (after the Factory's and plants' bonuses, before unit
 *  support) over its `PollutionDivisor`, less 20, or nothing at all from shields with a Solar Plant; plus its size times
 *  `populationFactor` over 4. Only a value above 0 risks pollution.
 */
const pollution = (city, cityYields = city.yields(), registries = {}, ruleRegistry = RuleRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) => (has(city, CityImprovements_1.SolarPlant, registries)
    ? 0
    : (0, pollution_1.productionPollution)(city, cityYields, Yields_1.Production, [Yields_1.UnitSupportProduction], ruleRegistry) - rules_1.pollutionTolerance) +
    (0, pollution_1.populationPollution)(city, (0, exports.populationFactor)(city, registries), rules_1.populationPollutionDivisor, cityGrowthRegistry);
exports.pollution = pollution;
/**
 * The size of a city's pollution roll (`city_process_pollution`): 256 less half its player's advances (counted from 1,
 *  as civ2-science counts them) times the level, that half halved while it's above 255 with a Solar Plant.
 */
const rollRange = (level, registries = {}) => (city) => {
    const advances = (0, source_1.withDefaults)(registries)
        .playerResearchRegistry.getByPlayer(city.player())
        .complete().length + 1;
    let chance = (advances * level()) >> 1;
    if (has(city, CityImprovements_1.SolarPlant, registries)) {
        while (chance > 255) {
            chance = Math.trunc(chance / 2);
        }
    }
    return rules_1.pollutionRollCeiling - chance;
};
exports.rollRange = rollRange;
exports.default = exports.pollution;
//# sourceMappingURL=pollution.js.map