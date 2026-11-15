"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meltdown = exports.nuclearBlast = exports.meltdownOdds = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const CityImprovements_1 = require("../CityImprovements");
const Removed_1 = require("@civ-clone/core-tile-improvement/Rules/Removed");
const core_random_1 = require("@civ-clone/core-random");
/** A Nuclear Plant melts down 1 time in (6 − level) (`city_process_pollution`): 1 in 6 on Chieftain, always on Deity. */
const meltdownOdds = (level) => 1 / Math.max(6 - level, 1);
exports.meltdownOdds = meltdownOdds;
/**
 * OpenCiv2's `nuclear_blast` (`src/auto/unit.cpp` ~5095, richardpenman/civ2@49f26ec), over `tile` and the 8 squares
 *  around it. It destroys no units (a nuclear attack does that itself, before its blast):
 *
 * - a city loses half its size, rounded down (`size -= size >> 1`);
 * - on land without a city, a Fortress is lost (not an Airbase), and on a roll of 1 in 2 each: the railroad; on
 *   farmland the farmland (the mine bit, leaving the irrigation), or else the mine and the irrigation, a roll each;
 *   then fallout 2 times in 3 (`rand() % 3 != 0`).
 */
const nuclearBlast = (tile, cause, { cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, randomNumberGenerator = core_random_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, } = {}) => {
    const onTile = (square, Type) => tileImprovementRegistry.getByTile(square).filter((improvement) => improvement instanceof Type &&
        // An Airbase is Civ2's Fortress bit and city bit together: only a Fortress alone is lost.
        !(Type === TileImprovements_1.Fortress && improvement.constructor !== TileImprovements_1.Fortress)), remove = (square, Type) => onTile(square, Type).forEach((improvement) => {
        ruleRegistry.process(Removed_1.default, square, improvement);
    }), halfTheTime = () => randomNumberGenerator() < 1 / 2;
    [tile, ...tile.getNeighbours()].forEach((square) => {
        const city = cityRegistry.getByTile(square);
        if (city !== null) {
            const cityGrowth = cityGrowthRegistry.getByCity(city), loss = cityGrowth.size() >> 1;
            for (let i = 0; i < loss; i++) {
                cityGrowth.shrink(cause);
            }
            return;
        }
        if (!square.isLand()) {
            return;
        }
        remove(square, TileImprovements_1.Fortress);
        if (halfTheTime()) {
            remove(square, TileImprovements_1.Railroad);
        }
        if (onTile(square, TileImprovements_1.Farmland).length === 0) {
            if (halfTheTime()) {
                remove(square, TileImprovements_1.Mine);
            }
            if (halfTheTime()) {
                remove(square, TileImprovements_1.Irrigation);
            }
        }
        else if (halfTheTime()) {
            remove(square, TileImprovements_1.Farmland);
        }
        if (randomNumberGenerator() < 2 / 3 &&
            onTile(square, TileImprovements_1.Pollution).length === 0) {
            // Building it processes `Built`, which puts it on the tile.
            new TileImprovements_1.Pollution(square, ruleRegistry);
        }
    });
};
exports.nuclearBlast = nuclearBlast;
/**
 * A Nuclear Plant's meltdown (`city_process_pollution`): the client is told (`city:nuclear-meltdown`, with the city),
 *  then `nuclearBlast` goes off over the city, and the plant is lost.
 */
const meltdown = (city, dependencies = {}) => {
    var _a;
    const { cityImprovementRegistry = CityImprovementRegistry_1.instance, engine = Engine_1.instance, } = dependencies, plants = cityImprovementRegistry
        .getByCity(city)
        .filter((improvement) => improvement instanceof CityImprovements_1.NuclearPlant);
    engine.emit('city:nuclear-meltdown', city);
    (0, exports.nuclearBlast)(city.tile(), (_a = plants[0]) !== null && _a !== void 0 ? _a : null, dependencies);
    plants.forEach((plant) => plant.destroy());
};
exports.meltdown = meltdown;
exports.default = exports.meltdown;
//# sourceMappingURL=meltdown.js.map