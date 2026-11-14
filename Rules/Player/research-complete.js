"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const CityImprovements_1 = require("../../CityImprovements");
const Yields_1 = require("../../Yields");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const improvements_1 = require("../../data/improvements");
const obsolete_1 = require("@civ-clone/base-city-improvement-rules/lib/obsolete");
const costOf = (Improvement) => {
    var _a, _b;
    return ((_b = (_a = improvements_1.default.find(([Type]) => Type === Improvement)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : 0) *
        cosmic_1.default.shieldBoxRows;
};
// Discovering Gunpowder or Mobile Warfare sells every one of the player's Barracks, for their cost in shields, 1 gold
//  each (OpenCiv2 `src/auto/civ.cpp` `civ_advance_sell_barracks`, richardpenman/civ2@49f26ec). They can be built again,
//  at a higher upkeep (`lib/upkeep`).
const getRules = (cityImprovementRegistry = CityImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, engine = Engine_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance) => (0, obsolete_1.default)([
    [CityImprovements_1.Barracks, Advances_1.Gunpowder],
    [CityImprovements_1.Barracks, Advances_1.MobileWarfare],
], { cityImprovementRegistry, cityRegistry, engine }, {
    idPrefix: 'civ2-city-improvement',
    removed: (player, Improvement, obsolete) => {
        var _a;
        if (obsolete.length === 0) {
            return;
        }
        (_a = playerTreasuryRegistry
            .getByPlayer(player)
            .find((treasury) => treasury.yield() === Yields_1.Gold)) === null || _a === void 0 ? void 0 : _a.add(costOf(Improvement) * obsolete.length);
    },
});
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=research-complete.js.map