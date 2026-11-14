"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describedRequirements = exports.buildRequirements = exports.notBuilt = exports.notInCity = exports.excludedBy = exports.requiresImprovement = exports.requiresAdvance = void 0;
const CityImprovements_1 = require("./CityImprovements");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const CityImprovement_1 = require("@civ-clone/core-city-improvement/CityImprovement");
const improvements_1 = require("./data/improvements");
// What Civilization II's city improvements need, and what stops a city building them (OpenCiv2 `src/auto/city.cpp`
//  `city_can_build_improvement`, richardpenman/civ2@49f26ec), as entries `Rules/City/build` makes its rules from.
/** The advance a city's player needs before it can build each improvement (@IMPROVE's fourth column). */
exports.requiresAdvance = (0, Requirement_1.table)('civ2-city-improvement:city/build/requires-advance', 'requires', improvements_1.default
    .filter(([, , , Advance]) => Advance !== null)
    .map(([Improvement, , , Advance]) => [Improvement, Advance]));
/** The improvements a city needs, any one of, before it can build each improvement. */
exports.requiresImprovement = (0, Requirement_1.table)('civ2-city-improvement:city/build/requires-improvement', 'requires', [
    [CityImprovements_1.Bank, CityImprovements_1.Marketplace],
    [CityImprovements_1.StockExchange, CityImprovements_1.Bank],
    [CityImprovements_1.University, CityImprovements_1.Library],
    [CityImprovements_1.ResearchLab, CityImprovements_1.University],
    [CityImprovements_1.SewerSystem, CityImprovements_1.Aqueduct],
    [CityImprovements_1.ManufacturingPlant, CityImprovements_1.Factory],
    [CityImprovements_1.PowerPlant, CityImprovements_1.Factory, CityImprovements_1.ManufacturingPlant],
    [CityImprovements_1.HydroPlant, CityImprovements_1.Factory, CityImprovements_1.ManufacturingPlant],
    [CityImprovements_1.NuclearPlant, CityImprovements_1.Factory, CityImprovements_1.ManufacturingPlant],
    [CityImprovements_1.SolarPlant, CityImprovements_1.Factory, CityImprovements_1.ManufacturingPlant],
], { mode: 'any', range: 'city' });
/**
 * The improvements, any one of, that stop a city building each improvement. A plant isn't built beside a better one:
 *  Civ2 lets a Hydro Plant join a Nuclear Plant, but not the other way round, and nothing joins a Solar Plant.
 */
exports.excludedBy = (0, Requirement_1.table)('civ2-city-improvement:city/build/excluded-by', 'excludedBy', [
    [CityImprovements_1.Courthouse, CityImprovements_1.Palace],
    [CityImprovements_1.PowerPlant, CityImprovements_1.HydroPlant, CityImprovements_1.NuclearPlant, CityImprovements_1.SolarPlant],
    [CityImprovements_1.HydroPlant, CityImprovements_1.SolarPlant],
    [CityImprovements_1.NuclearPlant, CityImprovements_1.HydroPlant, CityImprovements_1.SolarPlant],
], { mode: 'any', range: 'city' });
/** A city without one of the improvement already, which `Rules/City/build`'s own rule decides. */
exports.notInCity = new Requirement_1.Condition('civ2-city-improvement:not-in-city');
/** An improvement is built once in each city. The rule is written by hand; this entry names it for the civilopedia. */
exports.notBuilt = new Requirement_1.Requirement({
    id: 'civ2-city-improvement:city/build/not-built',
    subject: CityImprovement_1.default,
    relation: 'requires',
    targets: [exports.notInCity],
    range: 'city',
});
/** The entries `Rules/City/build`'s deriver makes rules from. */
exports.buildRequirements = [
    ...exports.requiresAdvance,
    ...exports.requiresImprovement,
    ...exports.excludedBy,
];
/** The entries that only describe: no rule is made from them. */
exports.describedRequirements = [exports.notBuilt];
exports.default = exports.buildRequirements;
//# sourceMappingURL=Requirements.js.map