"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const meltdown_1 = require("../../lib/meltdown");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const RuleIds_1 = require("../../RuleIds");
const CityImprovements_1 = require("../../CityImprovements");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Yields_1 = require("../../Yields");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const civilDisorder_1 = require("@civ-clone/base-city-happiness/lib/civilDisorder");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const core_random_1 = require("@civ-clone/core-random");
// OpenCiv2 `city_process_pollution` (`src/game/retvals.cpp` ~1460, richardpenman/civ2@49f26ec), after the pollution roll
//  and only for a person's city, as `city_process_turn` calls it: a city in civil disorder with a Nuclear Plant, whose
//  player doesn't know Fusion Power, melts down 1 time in (6 − level) (`lib/meltdown`). The disorder is the city's
//  this turn, as `city_process_disorder` has just set it: the ruleset's `CivilDisorder` rules on the turn's yields.
const getRules = (dependencies = {}) => {
    const { clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, randomNumberGenerator = core_random_1.instance, ruleRegistry = RuleRegistry_1.instance, } = dependencies;
    return [
        new ProcessYield_1.default(RuleIds_1.MELTDOWN_RULE, new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Criterion_1.default((cityYield, city) => (0, isHuman_1.default)(city.player(), clientRegistry)), new Criterion_1.default((cityYield, city) => (0, has_1.improvementOf)(city, CityImprovements_1.NuclearPlant, dependencies.cityImprovementRegistry) !== null), new Criterion_1.default((cityYield, city) => !playerResearchRegistry
            .getByPlayer(city.player())
            .completed(Advances_1.FusionPower)), new Criterion_1.default((cityYield, city, cityYields) => (0, civilDisorder_1.inCivilDisorder)(city, cityYields, ruleRegistry)), 
        // The roll only once every condition holds, so nothing else's rolls move.
        new Effect_1.default((cityYield, city) => {
            if (randomNumberGenerator() <
                (0, meltdown_1.meltdownOdds)((0, level_1.levelOf)(gameDifficultyRegistry))) {
                (0, meltdown_1.meltdown)(city, dependencies);
            }
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=meltdown.js.map