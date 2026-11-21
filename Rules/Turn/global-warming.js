"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const RuleIds_1 = require("../../RuleIds");
const PendingEffectRegistry_1 = require("@civ-clone/core-pending-effect/PendingEffectRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const level_1 = require("@civ-clone/base-global-warming/lib/level");
const globalWarming_1 = require("../../lib/globalWarming");
const rules_1 = require("../../data/rules");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const CityImprovements_1 = require("../../CityImprovements");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priorities_1 = require("@civ-clone/core-rule/Priorities");
const TileImprovements_1 = require("@civ-clone/civ2-world/TileImprovements");
const Start_1 = require("@civ-clone/core-turn-based-game/Rules/Start");
const WarmedTerrain_1 = require("@civ-clone/base-global-warming/Rules/WarmedTerrain");
const WarmingLevel_1 = require("@civ-clone/base-global-warming/Rules/WarmingLevel");
const WarmingPollution_1 = require("@civ-clone/base-global-warming/Rules/WarmingPollution");
const WarmingStrike_1 = require("@civ-clone/base-global-warming/Rules/WarmingStrike");
const WarmingTarget_1 = require("@civ-clone/base-global-warming/Rules/WarmingTarget");
const WarmingWarning_1 = require("@civ-clone/base-global-warming/Rules/WarmingWarning");
const pollution_1 = require("@civ-clone/base-global-warming/lib/pollution");
const globalWarming_2 = require("@civ-clone/base-global-warming/lib/globalWarming");
// Civilization II's global warming (OpenCiv2 `src/auto/game.cpp` `game_update_global_warming` 00486c2e, called from
//  `game_advance_turn` 00487371; `src/auto/map.cpp` `map_apply_global_warming` 004868fb; richardpenman/civ2@49f26ec), on
//  `base-global-warming`, one rule for each of its numbers. Only a person's cities pollute (`Rules/City/pollution`), as
//  in the original, so a game with no person never warms.
const getRules = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, engine = Engine_1.instance, pendingEffectRegistry = PendingEffectRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, turn = Turn_1.instance, } = {}) => [
    // `game_advance_turn` updates warming as each turn but the first ends, after the barbarians appear and before the
    //  power ranks: here at the start of every turn but the first, after the turn's other `Start` rules (`Low`).
    new Start_1.default(RuleIds_1.GLOBAL_WARMING_RULE, new Priorities_1.Low(), new Criterion_1.default((turn) => turn.value() > 1), new Effect_1.default(() => {
        (0, globalWarming_2.default)({
            Pollution: TileImprovements_1.Pollution,
            engine,
            pendingEffectRegistry,
            ruleRegistry,
            tileImprovementRegistry,
            turn,
            // The world a warming changes: the cities', or with none, the pollution's.
            world: () => {
                var _a, _b, _c;
                return (_c = (_b = ((_a = cityRegistry.entries().find((city) => !city.destroyed())) !== null && _a !== void 0 ? _a : tileImprovementRegistry
                    .entries()
                    .find((improvement) => improvement instanceof TileImprovements_1.Pollution))) === null || _b === void 0 ? void 0 : _b.tile().map()) !== null && _c !== void 0 ? _c : null;
            },
        });
    })),
    // `polluted − w + w / 2`: `w` counts a polluted square once for each computer player's city that has it in its radius.
    new WarmingPollution_1.default(RuleIds_1.WARMING_POLLUTION_RULE, new Effect_1.default((squares) => (0, pollution_1.discounted)((0, globalWarming_1.computerCityRadii)({ cityRegistry, clientRegistry }), rules_1.warmingComputerDivisor)(squares))),
    new WarmingTarget_1.default(RuleIds_1.WARMING_TARGET_RULE, new Effect_1.default((pollution, warmings) => rules_1.warmingPollutionFactor * pollution -
        rules_1.warmingPerWarming * warmings -
        (0, globalWarming_1.solarPlantCities)({ cityImprovementRegistry })), 
    // Each city with one, whoever's, takes one off the target.
    new Description_1.default({
        type: 'global_warming',
        subject: CityImprovements_1.SolarPlant,
        step: 'fewer',
    })),
    new WarmingLevel_1.default(RuleIds_1.WARMING_LEVEL_RULE, new Effect_1.default((0, level_1.stepToward)(rules_1.warmingStep, rules_1.warmingMinimum, rules_1.warmingMaximum))),
    new WarmingWarning_1.default(RuleIds_1.WARMING_WARNING_RULE, new Effect_1.default((0, level_1.atLevel)(rules_1.warmingWarningLevel, rules_1.warmingWarningPollutionAbove))),
    new WarmingStrike_1.default(RuleIds_1.WARMING_STRIKE_RULE, new Effect_1.default((0, level_1.aboveLevel)(rules_1.warmingStrikeAboveLevel))),
    new WarmedTerrain_1.default(RuleIds_1.WARMED_TERRAIN_RULE, new Effect_1.default(globalWarming_1.warmedTerrain)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=global-warming.js.map