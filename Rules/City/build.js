"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.wonderExclusionRules = exports.wonderExclusions = exports.siteRules = exports.notBuilt = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Wonders_1 = require("../../Wonders");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const source_1 = require("../../lib/source");
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const build_1 = require("@civ-clone/base-city-improvement-rules/lib/build");
const site_1 = require("../../lib/site");
const Requirements_1 = require("../../Requirements");
const prefix = 'civ2-city-improvement:city/build';
/** An improvement is built once in each city. */
const notBuilt = (cityImprovementRegistry = CityImprovementRegistry_1.instance) => (0, build_1.notBuiltRule)(`${prefix}/not-built`, cityImprovementRegistry);
exports.notBuilt = notBuilt;
/**
 * The improvements only built where the map allows (OpenCiv2 `city_can_build_improvement`): a Harbour and an Offshore
 *  Platform on the coast, a Port Facility and a Coastal Fortress with access to the ocean, and a Hydro Plant by a river
 *  or mountains (`lib/site`).
 */
const siteRules = (terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) => [
    ...[CityImprovements_1.Harbour, CityImprovements_1.OffshorePlatform].map((Improvement) => (0, build_1.siteRule)(`${prefix}/coastal/${Improvement.name}`, Improvement, site_1.isCoastal)),
    ...[CityImprovements_1.PortFacility, CityImprovements_1.CoastalFortress].map((Improvement) => (0, build_1.siteRule)(`${prefix}/ocean-access/${Improvement.name}`, Improvement, (city) => (0, site_1.isCoastal)(city) && (0, site_1.hasOceanAccess)(city))),
    (0, build_1.siteRule)(`${prefix}/hydro-site/${CityImprovements_1.HydroPlant.name}`, CityImprovements_1.HydroPlant, (city) => (0, site_1.isHydroSite)(city, terrainFeatureRegistry)),
];
exports.siteRules = siteRules;
/**
 * The improvements a Wonder its player owns already stands in for (OpenCiv2 `city_can_build_improvement`): no Granary
 *  with the Pyramids, Cathedral with Michelangelo's, Police Station with Women's Suffrage, Research Lab with SETI, or
 *  Power, Hydro or Nuclear Plant with the Hoover Dam.
 */
exports.wonderExclusions = [
    [CityImprovements_1.Granary, Wonders_1.Pyramids],
    [CityImprovements_1.Cathedral, Wonders_1.MichelangelosChapel],
    [CityImprovements_1.PoliceStation, Wonders_1.WomensSuffrage],
    [CityImprovements_1.ResearchLab, Wonders_1.SetiProgram],
    [CityImprovements_1.PowerPlant, Wonders_1.HooverDam],
    [CityImprovements_1.HydroPlant, Wonders_1.HooverDam],
    [CityImprovements_1.NuclearPlant, Wonders_1.HooverDam],
];
const wonderExclusionRules = (registries = {}) => exports.wonderExclusions.map(([Improvement, WonderType]) => (0, build_1.siteRule)(`${prefix}/excluded-by-wonder/${Improvement.name}`, Improvement, (city) => !(0, source_1.owns)(city.player(), WonderType, registries)));
exports.wonderExclusionRules = wonderExclusionRules;
/**
 * Every rule about which improvements a city may build, for a rule registry without a game's `requirements` (tests):
 *  a game's are registered through `game.requirements` (`registerRules`).
 */
const getRules = (cityImprovementRegistry = CityImprovementRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance, registries = {}) => [
    (0, exports.notBuilt)(cityImprovementRegistry),
    ...Requirements_1.default.flatMap((entry) => (0, build_1.buildRulesFor)(entry, cityImprovementRegistry, playerResearchRegistry)),
    ...(0, exports.siteRules)(terrainFeatureRegistry),
    ...(0, exports.wonderExclusionRules)(registries),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map