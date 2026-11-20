"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionBonus = exports.scienceBonus = exports.scienceLevel = exports.marketLevel = exports.plantSources = exports.factorySources = exports.scienceSources = exports.marketSources = void 0;
const CityImprovements_1 = require("../CityImprovements");
const Wonders_1 = require("../Wonders");
const source_1 = require("./source");
const rules_1 = require("../data/rules");
const level = (city, sources, registries) => sources.filter(([Improvement, WonderType]) => (0, source_1.hasEither)(city, Improvement, WonderType, registries)).length;
/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
exports.marketSources = [
    [CityImprovements_1.Marketplace, null],
    [CityImprovements_1.Bank, null],
    [CityImprovements_1.StockExchange, null],
];
/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
exports.scienceSources = [
    [CityImprovements_1.Library, null],
    [CityImprovements_1.University, null],
    [CityImprovements_1.ResearchLab, Wonders_1.SetiProgram],
];
/** `city_calc_shields_pollution`: the quarters of the shields a Factory and a Manufacturing Plant each add. */
exports.factorySources = [
    [CityImprovements_1.Factory, rules_1.factoryQuarters],
    [CityImprovements_1.ManufacturingPlant, rules_1.manufacturingPlantQuarters],
];
/** `city_calc_shields_pollution`: the plants (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam). */
exports.plantSources = [
    [CityImprovements_1.PowerPlant, null],
    [CityImprovements_1.HydroPlant, Wonders_1.HooverDam],
    [CityImprovements_1.NuclearPlant, null],
    [CityImprovements_1.SolarPlant, null],
];
/** `city_split_trade`: each of a Marketplace, a Bank and a Stock Exchange adds half the city's luxuries and tax. */
const marketLevel = (city, registries = {}) => level(city, exports.marketSources, registries);
exports.marketLevel = marketLevel;
/** `city_split_trade`: each of a Library, a University and a Research Lab (or SETI) adds half its science. */
const scienceLevel = (city, registries = {}) => level(city, exports.scienceSources, registries);
exports.scienceLevel = scienceLevel;
/** `city_split_trade`: a city's science bonus, `science × level ÷ 2`, but not halved in Isaac Newton's city. */
const scienceBonus = (city, science, registries = {}) => {
    const bonus = science * (0, exports.scienceLevel)(city, registries), newton = (0, source_1.withDefaults)(registries)
        .wonderRegistry.getByCity(city)
        .some((wonder) => wonder instanceof Wonders_1.IsaacNewtonsCollege);
    return newton ? bonus : bonus >> rules_1.cityBonusShift;
};
exports.scienceBonus = scienceBonus;
/**
 * `city_calc_shields_pollution`: the shields added: the quarters of `shields` its Factory and Manufacturing Plant add, and a
 *  plant's (a Power, Hydro, Nuclear or Solar Plant, or the Hoover Dam) no more than they do, each rounded down.
 */
const productionBonus = (city, shields, registries = {}) => {
    const factory = exports.factorySources.reduce((total, [Improvement, quarters]) => total + ((0, source_1.hasEither)(city, Improvement, null, registries) ? quarters : 0), 0);
    // No plant counts without a factory, so the plants aren't asked about then.
    if (factory === 0 || shields === 0) {
        return 0;
    }
    const plant = exports.plantSources.some(([Improvement, WonderType]) => (0, source_1.hasEither)(city, Improvement, WonderType, registries))
        ? rules_1.plantQuarters
        : 0;
    return (((shields * factory) >> 2) + ((shields * Math.min(plant, factory)) >> 2));
};
exports.productionBonus = productionBonus;
//# sourceMappingURL=bonus.js.map