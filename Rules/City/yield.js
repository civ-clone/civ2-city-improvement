"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("../../Yields");
const CityImprovements_1 = require("../../CityImprovements");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const source_1 = require("../../lib/source");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const governments_1 = require("@civ-clone/civ2-rules/data/governments");
const Terrains_1 = require("@civ-clone/civ2-world/Terrains");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const Yield_1 = require("@civ-clone/core-city/Rules/Yield");
const content_1 = require("../../lib/content");
const government_1 = require("@civ-clone/civ2-city/lib/government");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
// Squares' bonuses come after civ2-city's worked squares (0) and before its corruption (`High`, 1000); the Courthouse
//  after the corruption and before civ2-trade-rate's split (`Normal`, 2000); the tithes after the split.
const SQUARES = 500, COURTHOUSE = 1500, TITHES = 2500;
const ocean = (city) => city
    .tilesWorked()
    .entries()
    .filter((tile) => tile.terrain() instanceof Terrains_1.Ocean);
const getRules = (dependencies = {}) => {
    const registries = (0, source_1.withDefaults)(dependencies), { playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, } = dependencies, has = (city, Improvement) => (0, has_1.improvementOf)(city, Improvement, registries.cityImprovementRegistry) !==
        null, tithes = (city) => (0, content_1.tithes)(city, registries);
    return [
        // OpenCiv2 `city_tile_yield` (richardpenman/civ2@49f26ec): a Harbour adds 1 food to each ocean square the city
        //  works, an Offshore Platform 1 shield.
        ...[
            [CityImprovements_1.Harbour, Yields_1.Food],
            [CityImprovements_1.OffshorePlatform, Yields_1.Production],
        ].map(([Improvement, YieldType]) => new Yield_1.default(`civ2-city-improvement:city/yield/${Improvement.name}`, new Priority_1.default(SQUARES), new Criterion_1.default((city) => has(city, Improvement)), new Criterion_1.default((city) => ocean(city).length > 0), new Effect_1.default((city) => new YieldType(ocean(city).length, Improvement.name)))),
        // `city_tile_yield`: Superhighways add half the trade (rounded down) of each square with a road (or the city).
        new Yield_1.default(`civ2-city-improvement:city/yield/${CityImprovements_1.Superhighways.name}`, new Priority_1.default(SQUARES), new Criterion_1.default((city) => has(city, CityImprovements_1.Superhighways)), new Effect_1.default((city) => new Yields_1.Trade(city
            .tilesWorked()
            .entries()
            .filter((tile) => tile === city.tile() ||
            tileImprovementRegistry
                .getByTile(tile)
                .some((improvement) => improvement instanceof TileImprovements_1.Road))
            .reduce((total, tile) => total +
            Math.floor((0, reduceYields_1.reduceYield)(tile.yields(city.player()), Yields_1.Trade) / 2), 0), CityImprovements_1.Superhighways.name))),
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