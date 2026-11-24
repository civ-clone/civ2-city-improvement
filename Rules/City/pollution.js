"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const source_1 = require("../../lib/source");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const pollution_1 = require("../../lib/pollution");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const CityImprovements_1 = require("../../CityImprovements");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const rules_1 = require("../../data/rules");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Yields_1 = require("../../Yields");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const pollute_1 = require("@civ-clone/base-city-pollution/lib/pollute");
const core_random_1 = require("@civ-clone/core-random");
// Each turn a person's city with pollution (`lib/pollution`) may pollute one of the squares around it; as Civ2, no
//  computer player's city does (OpenCiv2 `city_process_turn`, which calls `city_process_pollution` only for a human player,
//  richardpenman/civ2@49f26ec). Once a turn: the consolidated shields are processed once a city.
const getRules = (dependencies = {}) => {
    const registries = (0, source_1.withDefaults)(dependencies), { cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, engine = Engine_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, randomNumberGenerator = core_random_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, } = dependencies;
    return [
        new ProcessYield_1.default(RuleIds_1.POLLUTION_RULE, new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield, city) => (0, isHuman_1.default)(city.player(), clientRegistry)), new Effect_1.default((cityYield, city, cityYields) => (0, pollute_1.pollute)(city, (0, pollution_1.pollution)(city, cityYields, registries, ruleRegistry, cityGrowthRegistry), {
            Pollution: TileImprovements_1.Pollution,
            rollRange: (0, pollution_1.rollRange)(() => (0, level_1.levelOf)(gameDifficultyRegistry), registries),
        }, {
            cityRegistry,
            tileImprovementRegistry,
            ruleRegistry,
            engine,
            randomNumberGenerator,
        })), new Description_1.default({
            type: 'pollution_source_removed',
            subject: CityImprovements_1.SolarPlant,
            source: 'production',
        }, {
            type: 'pollution_step',
            subject: CityImprovements_1.SolarPlant,
            value: rules_1.solarPlantPopulationSteps,
            source: 'population',
        }, {
            type: 'pollution_source_removed',
            subject: CityImprovements_1.MassTransit,
            source: 'population',
        }, 
        // What causes Pollution (civ-clone/web-renderer#621): a city's shields, and its people, a step for each
        //  polluting advance its player knows.
        { type: 'caused_by', subject: TileImprovements_1.Pollution, source: 'production' }, {
            type: 'caused_by',
            subject: TileImprovements_1.Pollution,
            source: 'population',
            with: pollution_1.pollutingAdvances,
        }, 
        // Only what passes the tolerance risks it, and the advances that move the people's step (`populationFactor`):
        //  a step less with Sanitation (without it, one more) and with Environmentalism, once they pollute at all
        //  (civ-clone/web-renderer#1339, civ-clone/web-renderer#1343).
        {
            type: 'pollution_tolerance',
            subject: TileImprovements_1.Pollution,
            value: rules_1.pollutionTolerance,
        }, ...[Advances_1.Sanitation, Advances_1.Environmentalism].map((Advance) => ({
            type: 'pollution_step',
            subject: Advance,
            value: 1,
            source: 'population',
            scope: 'player',
        })))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=pollution.js.map