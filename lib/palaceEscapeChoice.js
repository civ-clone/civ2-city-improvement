"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askPalaceEscape = exports.civ2CityWaitBeforePlunder = void 0;
const capital_1 = require("./capital");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const ChoiceMeta_1 = require("@civ-clone/core-client/ChoiceMeta");
const rules_1 = require("../data/rules");
/**
 * Hands a promise to civ2-city's plunder, so plunder waits for it, as `city_capture_aftermath` (~5462–5475) pays for the
 *  escape before it takes the plunder (capped to the gold left). civ2-city's `lib/captureAftermath` exports
 *  `waitBeforePlunder(city, pending)` for this; until it does, plunder doesn't wait, and the escape is paid for from
 *  what plunder left.
 */
const civ2CityWaitBeforePlunder = (city, pending) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const aftermath = require('@civ-clone/civ2-city/lib/captureAftermath');
        if (typeof aftermath.waitBeforePlunder === 'function') {
            aftermath.waitBeforePlunder(city, pending);
        }
    }
    catch (e) {
        // No civ2-city: nothing to wait.
    }
};
exports.civ2CityWaitBeforePlunder = civ2CityWaitBeforePlunder;
/**
 * Civ2 asks a person whose capital was just taken, then and there, whether to pay 1000 gold to move the Palace to
 *  `escape` (`city_capture_aftermath_palace_escape` ~4790, `popup_game_with_sprite(str_canescape_2)`): their client is
 *  asked (`capture-city.palace-escape`, yes or no, with the city and the cost), and on yes the Palace is built there and
 *  paid for. The capture's plunder waits for the answer (`waitBeforePlunder`).
 */
const askPalaceEscape = (captured, loser, escape, dependencies = {}) => {
    const { clientRegistry = ClientRegistry_1.instance, waitBeforePlunder = exports.civ2CityWaitBeforePlunder, } = dependencies, pending = (async () => {
        const answer = await clientRegistry
            .getByPlayer(loser)
            .chooseFromList(new ChoiceMeta_1.default([true, false], 'capture-city.palace-escape', { city: escape, cost: rules_1.palaceEscapeCost }));
        if (answer !== true ||
            escape.destroyed() ||
            escape.player() !== loser ||
            (0, capital_1.goldOf)(loser, dependencies) < rules_1.palaceEscapeCost) {
            return false;
        }
        (0, capital_1.escapeTo)(escape, loser, dependencies);
        return true;
    })();
    waitBeforePlunder(captured, pending);
    return pending;
};
exports.askPalaceEscape = askPalaceEscape;
exports.default = exports.askPalaceEscape;
//# sourceMappingURL=palaceEscapeChoice.js.map