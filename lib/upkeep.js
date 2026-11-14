"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paysUpkeep = exports.upkeep = exports.freeUnderFundamentalism = void 0;
const governments_1 = require("@civ-clone/civ2-rules/data/governments");
const CityImprovements_1 = require("../CityImprovements");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const PlayerGovernmentRegistry_1 = require("@civ-clone/core-government/PlayerGovernmentRegistry");
const source_1 = require("./source");
const Wonders_1 = require("../Wonders");
const rules_1 = require("../data/rules");
const government_1 = require("@civ-clone/civ2-city/lib/government");
const improvements_1 = require("../data/improvements");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const rowUpkeep = new Map(improvements_1.default.map(([Improvement, , upkeep]) => [Improvement, upkeep]));
/** The improvements Fundamentalism keeps for nothing. */
exports.freeUnderFundamentalism = [
    CityImprovements_1.Temple,
    CityImprovements_1.Colosseum,
    CityImprovements_1.Cathedral,
];
/**
 * What `Improvement` costs `player` in gold a turn (OpenCiv2 `src/auto/civ.cpp` `civ_improvement_upkeep`,
 *  richardpenman/civ2@49f26ec): its @IMPROVE upkeep; Barracks 1 less below Prince, 1 more with Gunpowder and 1 more
 *  with Mobile Warfare; nothing for an upkeep of 1 with Adam Smith's; and nothing for a Temple, Colosseum or Cathedral
 *  under Fundamentalism.
 */
const upkeep = (Improvement, player, { gameDifficultyRegistry = GameDifficultyRegistry_1.instance, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance, ...registries } = {}) => {
    var _a;
    let cost = (_a = rowUpkeep.get(Improvement)) !== null && _a !== void 0 ? _a : 0;
    if (Improvement === CityImprovements_1.Barracks) {
        const research = (0, source_1.withDefaults)(registries).playerResearchRegistry.getByPlayer(player);
        if ((0, level_1.levelOf)(gameDifficultyRegistry) < rules_1.barracksPrinceLevel && cost !== 0) {
            cost--;
        }
        if (research.completed(Advances_1.Gunpowder)) {
            cost++;
        }
        if (research.completed(Advances_1.MobileWarfare)) {
            cost++;
        }
    }
    if (cost === 1 && (0, source_1.owns)(player, Wonders_1.AdamSmithsTradingCompany, registries)) {
        cost = 0;
    }
    if (cost !== 0 &&
        exports.freeUnderFundamentalism.includes(Improvement) &&
        (0, government_1.default)(player, playerGovernmentRegistry) === governments_1.FUNDAMENTALISM) {
        cost = 0;
    }
    return cost;
};
exports.upkeep = upkeep;
/** Whether `player`'s cities pay upkeep at all: not under Anarchy (OpenCiv2 `city_pay_improvement_upkeep`). */
const paysUpkeep = (player, playerGovernmentRegistry = PlayerGovernmentRegistry_1.instance) => (0, government_1.default)(player, playerGovernmentRegistry) !== governments_1.ANARCHY;
exports.paysUpkeep = paysUpkeep;
exports.default = exports.upkeep;
//# sourceMappingURL=upkeep.js.map