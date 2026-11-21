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
const cancelSpaceship_1 = require("@civ-clone/base-spaceship/lib/cancelSpaceship");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const founder_1 = require("@civ-clone/civ2-city/lib/founder");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const rules_1 = require("../../data/rules");
const Description_1 = require("@civ-clone/core-rule/Description");
const core_random_1 = require("@civ-clone/core-random");
const Yields_1 = require("../../Yields");
const source_1 = require("../../lib/source");
/** Lost when a city is taken by anyone but its founder (OpenCiv2 `city_capture_aftermath`). */
exports.lostOnCapture = [
    CityImprovements_1.Palace,
    CityImprovements_1.Temple,
    CityImprovements_1.Cathedral,
    CityImprovements_1.Courthouse,
];
/** Those `lostOnCapture` that the `lost` rule takes: the Palace goes by a rule of its own. */
const lostWithTheCity = exports.lostOnCapture.filter((Improvement) => Improvement !== CityImprovements_1.Palace);
const rowOf = new Map(improvements_1.default.map(([Improvement], index) => [Improvement, index + 1]));
// OpenCiv2 `src/auto/city.cpp` `city_capture_aftermath` (richardpenman/civ2@49f26ec), in its order:
//  - a player that loses its capital may buy the Palace into another city for 1000 gold (`lib/capital`): a computer
//    player decides by itself, a person's client is asked, and plunder waits for the answer (`lib/palaceEscapeChoice`);
//  - the Palace is lost (Civ2 leaves the bit on a city its founder retakes, which would give the founder a second
//    capital: here it's always lost);
//  - taken by anyone but its founder, the city loses its Temple, Cathedral and Courthouse, and then, conquered rather
//    than incited, every improvement in an odd @IMPROVE row, or every one in an even row, on one roll. Wonders aren't
//    improvements here. The founder is civ2-city's (`lib/founder`, `was_founder` ~5440): the loser of the city's last
//    capture, or whoever has held it 63 turns since, read before civ2-city records this capture.
const getRules = (dependencies = {}, randomNumberGenerator = core_random_1.instance) => {
    const { cityImprovementRegistry } = (0, source_1.withDefaults)(dependencies), { clientRegistry = ClientRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, } = dependencies, standing = (city) => cityImprovementRegistry
        .getByCity(city)
        .filter((improvement) => !(improvement instanceof Wonder_1.default));
    return [
        new Captured_1.default('civ2-city-improvement:city/captured/palace-escape', new Criterion_1.default((city) => standing(city).some((improvement) => improvement instanceof CityImprovements_1.Palace)), new Effect_1.default((city, capturer, loser) => {
            // A civil war that couldn't break out leaves no escape (`lib/capital`'s `barPalaceEscape`), and has lost the
            //  ship itself. Asked here, not as a `Criterion`: every rule's criteria are asked before any effect runs, and
            //  the civil war's is an effect.
            if ((0, capital_1.palaceEscapeBarred)(city)) {
                return;
            }
            // Whenever the Palace isn't saved, the spaceship is lost (`civ_spaceship_lost_notify`, city.cpp ~4819).
            const loseShip = () => (0, cancelSpaceship_1.default)(loser, spaceshipRegistry);
            if (!(0, isHuman_1.default)(loser, clientRegistry)) {
                const escape = (0, capital_1.palaceEscape)(city, loser, dependencies);
                if (escape === null) {
                    loseShip();
                    return;
                }
                (0, capital_1.escapeTo)(escape, loser, dependencies);
                return;
            }
            if ((0, capital_1.goldOf)(loser, dependencies) < rules_1.palaceEscapeCost) {
                loseShip();
                return;
            }
            const escape = (0, capital_1.palaceEscapeCandidate)(city, loser, dependencies);
            if (escape === null) {
                loseShip();
                return;
            }
            (0, palaceEscapeChoice_1.askPalaceEscape)(city, loser, escape, dependencies).then((saved) => {
                if (!saved) {
                    loseShip();
                }
            }, loseShip);
        }), 
        // Its conditions (the city's size, the difficulty, the owner's cities and gold) are left to the code.
        new Description_1.default({
            type: 'palace_escape',
            subject: CityImprovements_1.Palace,
            value: rules_1.palaceEscapeCost,
            yield: Yields_1.Gold,
        })),
        new Captured_1.default('civ2-city-improvement:city/captured/palace', new Effect_1.default((city) => standing(city)
            .filter((improvement) => improvement instanceof CityImprovements_1.Palace)
            .forEach((palace) => palace.destroy())), new Description_1.default({ type: 'lost_on_capture', subject: CityImprovements_1.Palace })),
        new Captured_1.default('civ2-city-improvement:city/captured/lost', new Criterion_1.default((city, capturer, loser) => (0, founder_1.founderOf)(city, loser, dependencies) !== capturer), new Effect_1.default((city, capturer, loser, cause) => {
            standing(city)
                .filter((improvement) => exports.lostOnCapture.some((Lost) => improvement instanceof Lost))
                .forEach((improvement) => improvement.destroy());
            // Only a conquest rolls: a city a Diplomat or Spy incites keeps the rest.
            if (cause instanceof InciteRevolt_1.default) {
                return;
            }
            // One roll decides whether the odd rows are kept or the even ones.
            const keepOdd = randomNumberGenerator() < rules_1.captureKeepOddRowsChance;
            standing(city)
                .filter((improvement) => {
                var _a;
                return ((_a = rowOf.get(improvement.constructor)) !== null && _a !== void 0 ? _a : 0) % 2 ===
                    (keepOdd ? 0 : 1);
            })
                .forEach((improvement) => improvement.destroy());
        }), 
        // Taken by anyone but the founder: these always, and on a conquest each of the rest at even odds (an odd row's is
        //  lost when the even rows are kept, and so the other way round).
        new Description_1.default(...lostWithTheCity.map((Improvement) => ({
            type: 'lost_on_capture',
            subject: Improvement,
            unless: 'founder',
        })), ...improvements_1.default
            .filter(([Improvement]) => Improvement !== CityImprovements_1.Palace && !exports.lostOnCapture.includes(Improvement))
            .map(([Improvement]) => ({
            type: 'lost_on_capture',
            subject: Improvement,
            unless: 'founder',
            value: rowOf.get(Improvement) % 2 === 0
                ? rules_1.captureKeepOddRowsChance
                : 1 - rules_1.captureKeepOddRowsChance,
        })))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map