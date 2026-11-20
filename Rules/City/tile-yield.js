"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const Yields_1 = require("../../Yields");
const CityImprovements_1 = require("../../CityImprovements");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const CityTileYield_1 = require("@civ-clone/core-city/Rules/CityTileYield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const rules_1 = require("../../data/rules");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Terrains_1 = require("@civ-clone/civ2-world/Terrains");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const tileYieldPipeline_1 = require("@civ-clone/civ2-city/lib/tileYieldPipeline");
const yieldModifiers_1 = require("@civ-clone/base-tile-improvement/lib/yieldModifiers");
const isOcean = (tile) => tile.terrain() instanceof Terrains_1.Ocean;
/**
 * What the city's improvements add to each square it works, at their steps of OpenCiv2's `city_tile_yield`
 *  (`src/auto/city.cpp` ~2796, richardpenman/civ2@49f26ec), in civ2-city's order (`lib/tileYieldPipeline`). Each step
 *  adds a new yield of the type, named for the improvement, to the square's yields for this city:
 *
 * - `harbour` (~2835): +1 food on an ocean square.
 * - `offshorePlatform` (~2838): +1 shield on an ocean square.
 * - `supermarket` (~2851–2858): food += food >> 1 on farmland or the city's own square (which counts as farmland,
 *   `TILE_CITY`), on land, after the irrigation.
 * - `superhighways` (~2926–2929): trade += trade / 2 on a square with a road or the city's own square, after the
 *   government's penalty and trade bonus and before pollution.
 */
const getRules = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, } = {}) => {
    const has = (Improvement) => (city) => (0, has_1.improvementOf)(city, Improvement, cityImprovementRegistry) !== null, hasOn = (tile, ...Types) => tileImprovementRegistry
        .getByTile(tile)
        .some((improvement) => Types.some((Type) => improvement instanceof Type)), adds = (YieldType, amount, provider) => (city, tile, yields) => {
        const added = amount((0, yieldModifiers_1.totalOf)(yields, YieldType));
        if (added !== 0) {
            yields.push(new YieldType(added, provider));
        }
    };
    return [
        new CityTileYield_1.default(`civ2-city-improvement:city/tile-yield/${CityImprovements_1.Harbour.name}`, (0, tileYieldPipeline_1.tileYieldPriority)('harbour'), new Criterion_1.default((city, tile) => isOcean(tile)), new Criterion_1.default(has(CityImprovements_1.Harbour)), new Effect_1.default(adds(Yields_1.Food, () => rules_1.harbourFood, CityImprovements_1.Harbour.name)), new Description_1.default({
            type: 'tile_yield',
            subject: CityImprovements_1.Harbour,
            yield: Yields_1.Food,
            value: rules_1.harbourFood,
            on: 'ocean',
        })),
        new CityTileYield_1.default(`civ2-city-improvement:city/tile-yield/${CityImprovements_1.OffshorePlatform.name}`, (0, tileYieldPipeline_1.tileYieldPriority)('offshorePlatform'), new Criterion_1.default((city, tile) => isOcean(tile)), new Criterion_1.default(has(CityImprovements_1.OffshorePlatform)), new Effect_1.default(adds(Yields_1.Production, () => rules_1.offshorePlatformProduction, CityImprovements_1.OffshorePlatform.name)), new Description_1.default({
            type: 'tile_yield',
            subject: CityImprovements_1.OffshorePlatform,
            yield: Yields_1.Production,
            value: rules_1.offshorePlatformProduction,
            on: 'ocean',
        })),
        new CityTileYield_1.default(`civ2-city-improvement:city/tile-yield/${CityImprovements_1.Supermarket.name}`, (0, tileYieldPipeline_1.tileYieldPriority)('supermarket'), new Criterion_1.default(has(CityImprovements_1.Supermarket)), new Criterion_1.default((city, tile) => !isOcean(tile)), new Criterion_1.default((city, tile) => tile === city.tile() || hasOn(tile, TileImprovements_1.Farmland)), new Effect_1.default(adds(Yields_1.Food, (food) => food >> rules_1.supermarketShift, CityImprovements_1.Supermarket.name)), new Description_1.default({
            type: 'tile_yield_percent',
            subject: CityImprovements_1.Supermarket,
            yield: Yields_1.Food,
            value: 1 / (1 << rules_1.supermarketShift),
            on: 'farmland',
        })),
        new CityTileYield_1.default(`civ2-city-improvement:city/tile-yield/${CityImprovements_1.Superhighways.name}`, (0, tileYieldPipeline_1.tileYieldPriority)('superhighways'), new Criterion_1.default(has(CityImprovements_1.Superhighways)), 
        // A railroad is built on a road, so Civ2's road bit is set on it too.
        new Criterion_1.default((city, tile) => tile === city.tile() || hasOn(tile, TileImprovements_1.Road, TileImprovements_1.Railroad)), new Effect_1.default(adds(Yields_1.Trade, (trade) => Math.trunc(trade / rules_1.superhighwaysDivisor), CityImprovements_1.Superhighways.name)), new Description_1.default({
            type: 'tile_yield_percent',
            subject: CityImprovements_1.Superhighways,
            yield: Yields_1.Trade,
            value: 1 / rules_1.superhighwaysDivisor,
            on: 'roads',
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=tile-yield.js.map