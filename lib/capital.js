"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeTo = exports.palaceEscapeBarred = exports.barPalaceEscape = exports.palaceEscape = exports.palaceEscapeCandidate = exports.goldOf = exports.capitalOf = void 0;
const CityImprovements_1 = require("../CityImprovements");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const LandMassRegistry_1 = require("@civ-clone/core-world/LandMassRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const source_1 = require("./source");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const rules_1 = require("../data/rules");
const Yields_1 = require("../Yields");
const Wonders_1 = require("../Wonders");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const ship_1 = require("@civ-clone/civ2-spaceship/lib/ship");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
/** `player`'s standing Palace's city, or `null`. */
const capitalOf = (player, { cityImprovementRegistry } = {}) => {
    var _a, _b;
    return (_b = (_a = (0, source_1.withDefaults)({ cityImprovementRegistry })
        .cityImprovementRegistry.getByType(CityImprovements_1.Palace)
        .find((palace) => palace.city().player() === player)) === null || _a === void 0 ? void 0 : _a.city()) !== null && _b !== void 0 ? _b : null;
};
exports.capitalOf = capitalOf;
const goldTreasury = (player, playerTreasuryRegistry) => playerTreasuryRegistry
    .getByPlayer(player)
    .find((treasury) => treasury.yield() === Yields_1.Gold);
/** How much gold `player` has. */
const goldOf = (player, { playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, } = {}) => { var _a, _b; return (_b = (_a = goldTreasury(player, playerTreasuryRegistry)) === null || _a === void 0 ? void 0 : _a.value()) !== null && _b !== void 0 ? _b : 0; };
exports.goldOf = goldOf;
/**
 * The city `loser`'s Palace could escape to once its capital is taken (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape` ~4717, richardpenman/civ2@49f26ec), whoever plays it: its best city of size 8
 *  or more and at least half the captured city's size. A city scores 3 a citizen, less its distance from the captured
 *  city, plus 4 for each point of defence on its square; then, each with C's integer arithmetic, × 3 / 2 with a SAM
 *  Missile Battery, × 2 with City Walls (or the Great Wall), × 3 with an SDI Defense, and / 2 on another land mass. The
 *  first best score wins. `null` when no city qualifies.
 */
const palaceEscapeCandidate = (captured, loser, dependencies = {}) => {
    const { cityGrowthRegistry = CityGrowthRegistry_1.instance, cityRegistry = CityRegistry_1.instance, landMassRegistry = LandMassRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, } = dependencies, registries = (0, source_1.withDefaults)(dependencies), size = (city) => cityGrowthRegistry.getByCity(city).size(), capturedSize = size(captured), capturedLandMass = landMassRegistry.getByTile(captured.tile());
    let best = null, bestScore = -999;
    cityRegistry
        .getByPlayer(loser)
        .filter((city) => city !== captured &&
        size(city) >= rules_1.palaceEscapeMinimumSize &&
        size(city) >= Math.trunc(capturedSize / 2))
        .forEach((city) => {
        let score = size(city) * 3 -
            Math.round(city.tile().distanceFrom(captured.tile())) +
            unitRegistry
                .getByTile(city.tile())
                .reduce((total, unit) => total + unit.defence().value(), 0) *
                4;
        if ((0, has_1.improvementOf)(city, CityImprovements_1.SamMissileBattery, registries.cityImprovementRegistry)) {
            score = Math.trunc((score * 3) / 2);
        }
        if ((0, source_1.hasEither)(city, CityImprovements_1.CityWalls, Wonders_1.GreatWall, registries)) {
            score *= 2;
        }
        if ((0, has_1.improvementOf)(city, CityImprovements_1.SdiDefence, registries.cityImprovementRegistry)) {
            score *= 3;
        }
        if (landMassRegistry.getByTile(city.tile()) !== capturedLandMass) {
            score = Math.trunc(score / 2);
        }
        if (score > bestScore) {
            bestScore = score;
            best = city;
        }
    });
    return best;
};
exports.palaceEscapeCandidate = palaceEscapeCandidate;
/**
 * Where a computer player whose capital was just taken moves its Palace, if it does (`city_capture_aftermath_palace_escape`):
 *  with more than 999 gold, to `palaceEscapeCandidate`'s city, and only above Prince, with a spaceship (civ2-spaceship's
 *  `hasSpaceship`: parts built, or launched), more than 11 cities or more than 1999 gold. `null` when it doesn't. A person is asked instead (`lib/palaceEscapeOffer`).
 */
const palaceEscape = (captured, loser, dependencies = {}) => {
    const { cityRegistry = CityRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, } = dependencies, gold = (0, exports.goldOf)(loser, dependencies), cities = cityRegistry
        .getByPlayer(loser)
        .filter((city) => city !== captured);
    if ((0, isHuman_1.default)(loser, clientRegistry) ||
        (0, level_1.levelOf)(gameDifficultyRegistry) <= rules_1.palaceEscapeAboveLevel ||
        gold < rules_1.palaceEscapeCost ||
        !((0, ship_1.hasSpaceship)(loser, spaceshipRegistry) ||
            cities.length > rules_1.palaceEscapeCities ||
            gold > rules_1.palaceEscapeGold)) {
        return null;
    }
    return (0, exports.palaceEscapeCandidate)(captured, loser, dependencies);
};
exports.palaceEscape = palaceEscape;
// Captured capitals whose Palace may not escape.
const barred = new WeakSet();
/**
 * `captured`'s Palace may not escape: a computer player's civil war that couldn't break out has already chosen where
 *  the next one is built (`city_capture_aftermath` passes `city4`, and `city_capture_aftermath_palace_escape` offers no
 *  escape then). For the civil war's `Captured` rule to call before this package's escape rule runs.
 */
const barPalaceEscape = (captured) => {
    barred.add(captured);
};
exports.barPalaceEscape = barPalaceEscape;
/** Whether `captured`'s Palace may not escape (`barPalaceEscape`). */
const palaceEscapeBarred = (captured) => barred.has(captured);
exports.palaceEscapeBarred = palaceEscapeBarred;
/** Moves `loser`'s Palace to `city` for `palaceEscapeCost` gold. */
const escapeTo = (city, loser, { playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, } = {}) => {
    var _a;
    (_a = goldTreasury(loser, playerTreasuryRegistry)) === null || _a === void 0 ? void 0 : _a.subtract(rules_1.palaceEscapeCost);
    // Building it processes `Created`, which registers it and destroys any other of the player's.
    new CityImprovements_1.Palace(city, ruleRegistry);
};
exports.escapeTo = escapeTo;
//# sourceMappingURL=capital.js.map