"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.lostOnCapture = void 0;
const palaceEscapeChoice_1 = require("../../lib/palaceEscapeChoice");
const capital_1 = require("../../lib/capital");
const CityImprovements_1 = require("../../CityImprovements");
const InciteRevolt_1 = require("@civ-clone/base-unit-action-incite-revolt/InciteRevolt");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const improvements_1 = require("../../data/improvements");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const rules_1 = require("../../data/rules");
const core_random_1 = require("@civ-clone/core-random");
const source_1 = require("../../lib/source");
/** Lost when a city is taken by anyone but its founder (OpenCiv2 `city_capture_aftermath`). */
exports.lostOnCapture = [
    CityImprovements_1.Palace,
    CityImprovements_1.Temple,
    CityImprovements_1.Cathedral,
    CityImprovements_1.Courthouse,
];
const rowOf = new Map(improvements_1.default.map(([Improvement], index) => [Improvement, index + 1]));
const isFounder = (city, capturer) => city.originalPlayer() === capturer;
// OpenCiv2 `src/auto/city.cpp` `city_capture_aftermath` (richardpenman/civ2@49f26ec), in its order:
//  - a player that loses its capital may buy the Palace into another city for 1000 gold (`lib/capital`): a computer
//    player decides by itself, a person's client is asked, and plunder waits for the answer (`lib/palaceEscapeChoice`);
//  - the Palace is lost (Civ2 leaves the bit on a city its founder retakes, which would give the founder a second
//    capital: here it's always lost);
//  - taken by anyone but its founder, the city loses its Temple, Cathedral and Courthouse, and then, conquered rather
//    than incited, every improvement in an odd @IMPROVE row, or every one in an even row, on one roll. Wonders aren't
//    improvements here. The founder is the city's original player (as civ2-city has it); Civ2 makes the loser the
//    founder after each capture.
const getRules = (dependencies = {}, randomNumberGenerator = core_random_1.instance) => {
    const { cityImprovementRegistry } = (0, source_1.withDefaults)(dependencies), { clientRegistry = ClientRegistry_1.instance } = dependencies, standing = (city) => cityImprovementRegistry
        .getByCity(city)
        .filter((improvement) => !(improvement instanceof Wonder_1.default));
    return [
        new Captured_1.default('civ2-city-improvement:city/captured/palace-escape', new Criterion_1.default((city) => standing(city).some((improvement) => improvement instanceof CityImprovements_1.Palace)), new Effect_1.default((city, capturer, loser) => {
            if (!(0, isHuman_1.default)(loser, clientRegistry)) {
                const escape = (0, capital_1.palaceEscape)(city, loser, dependencies);
                if (escape !== null) {
                    (0, capital_1.escapeTo)(escape, loser, dependencies);
                }
                return;
            }
            if ((0, capital_1.goldOf)(loser, dependencies) < rules_1.palaceEscapeCost) {
                return;
            }
            const escape = (0, capital_1.palaceEscapeCandidate)(city, loser, dependencies);
            if (escape !== null) {
                (0, palaceEscapeChoice_1.askPalaceEscape)(city, loser, escape, dependencies);
            }
        })),
        new Captured_1.default('civ2-city-improvement:city/captured/palace', new Effect_1.default((city) => standing(city)
            .filter((improvement) => improvement instanceof CityImprovements_1.Palace)
            .forEach((palace) => palace.destroy()))),
        new Captured_1.default('civ2-city-improvement:city/captured/lost', new Criterion_1.default((city, capturer) => !isFounder(city, capturer)), new Effect_1.default((city, capturer, loser, cause) => {
            standing(city)
                .filter((improvement) => exports.lostOnCapture.some((Lost) => improvement instanceof Lost))
                .forEach((improvement) => improvement.destroy());
            // Only a conquest rolls: a city a Diplomat or Spy incites keeps the rest.
            if (cause instanceof InciteRevolt_1.default) {
                return;
            }
            // One roll decides whether the odd rows are kept or the even ones.
            const keepOdd = randomNumberGenerator() < 0.5;
            standing(city)
                .filter((improvement) => {
                var _a;
                return ((_a = rowOf.get(improvement.constructor)) !== null && _a !== void 0 ? _a : 0) % 2 ===
                    (keepOdd ? 0 : 1);
            })
                .forEach((improvement) => improvement.destroy());
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map