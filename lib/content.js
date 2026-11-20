"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tithes = exports.contentDescriptions = exports.contentImprovements = exports.contents = exports.temple = exports.cathedral = exports.colosseum = void 0;
const CityImprovements_1 = require("../CityImprovements");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const Wonders_1 = require("../Wonders");
const source_1 = require("./source");
const rules_1 = require("../data/rules");
const knows = (city, Advance, registries) => (0, source_1.withDefaults)(registries)
    .playerResearchRegistry.getByPlayer(city.player())
    .completed(Advance);
/**
 * The content citizens of Civilization II's stage 2 (OpenCiv2 `src/auto/city.cpp` `city_calc_trade_happiness`,
 *  richardpenman/civ2@49f26ec), in its order:
 *  - a Colosseum, 3, and 1 more with Electronics;
 *  - with Monotheism, a Cathedral or Michelangelo's, 3, 1 fewer without Theology and 1 more without Communism;
 *  - a Temple, 1 with Ceremonial Burial and 1 with Mysticism, doubled by the Oracle.
 */
const colosseum = (city, registries = {}) => {
    const source = (0, source_1.sourceOf)(city, CityImprovements_1.Colosseum, null, registries);
    return source === null
        ? null
        : {
            source,
            value: rules_1.colosseumContent +
                (knows(city, Advances_1.Electronics, registries)
                    ? rules_1.colosseumElectronicsContent
                    : 0),
        };
};
exports.colosseum = colosseum;
const cathedral = (city, registries = {}) => {
    if (!knows(city, Advances_1.Monotheism, registries)) {
        return null;
    }
    const source = (0, source_1.sourceOf)(city, CityImprovements_1.Cathedral, Wonders_1.MichelangelosChapel, registries);
    return source === null
        ? null
        : {
            source,
            value: rules_1.cathedralContent -
                (knows(city, Advances_1.Theology, registries) ? 0 : rules_1.cathedralTheologyContent) +
                (knows(city, Advances_1.Communism, registries) ? 0 : rules_1.cathedralCommunismContent),
        };
};
exports.cathedral = cathedral;
const temple = (city, registries = {}) => {
    const source = (0, source_1.sourceOf)(city, CityImprovements_1.Temple, null, registries);
    if (source === null) {
        return null;
    }
    const value = (knows(city, Advances_1.Mysticism, registries) ? rules_1.templeContentPerAdvance : 0) +
        (knows(city, Advances_1.CeremonialBurial, registries) ? rules_1.templeContentPerAdvance : 0);
    return {
        source,
        value: (0, source_1.owns)(city.player(), Wonders_1.Oracle, registries)
            ? value * rules_1.oracleMultiplier
            : value,
    };
};
exports.temple = temple;
exports.contents = [exports.colosseum, exports.cathedral, exports.temple];
/** The improvements `contents` asks about, in its order. */
exports.contentImprovements = [
    CityImprovements_1.Colosseum,
    CityImprovements_1.Cathedral,
    CityImprovements_1.Temple,
];
/** What each of `contents` does, for the Civilopedia (civ-clone/web-renderer#1196). */
exports.contentDescriptions = new Map([
    [
        exports.colosseum,
        [
            { type: 'content', subject: CityImprovements_1.Colosseum, value: rules_1.colosseumContent },
            {
                type: 'content',
                subject: CityImprovements_1.Colosseum,
                value: rules_1.colosseumElectronicsContent,
                step: 'more',
                with: [Advances_1.Electronics],
            },
        ],
    ],
    [
        exports.cathedral,
        [
            {
                type: 'content',
                subject: CityImprovements_1.Cathedral,
                value: rules_1.cathedralContent,
                with: [Advances_1.Monotheism],
            },
            {
                type: 'content',
                subject: CityImprovements_1.Cathedral,
                value: rules_1.cathedralTheologyContent,
                step: 'fewer',
                until: Advances_1.Theology,
            },
            {
                type: 'content',
                subject: CityImprovements_1.Cathedral,
                value: rules_1.cathedralCommunismContent,
                step: 'more',
                until: Advances_1.Communism,
            },
            {
                type: 'acts_as',
                subject: Wonders_1.MichelangelosChapel,
                improvement: CityImprovements_1.Cathedral,
                scope: 'player',
            },
        ],
    ],
    [
        exports.temple,
        [
            {
                type: 'content',
                subject: CityImprovements_1.Temple,
                value: rules_1.templeContentPerAdvance,
                with: [Advances_1.CeremonialBurial],
            },
            {
                type: 'content',
                subject: CityImprovements_1.Temple,
                value: rules_1.templeContentPerAdvance,
                step: 'more',
                with: [Advances_1.Mysticism],
            },
            {
                type: 'content_multiplier',
                subject: Wonders_1.Oracle,
                value: rules_1.oracleMultiplier,
                inCitiesWith: [CityImprovements_1.Temple],
                scope: 'player',
            },
        ],
    ],
]);
/**
 * Fundamentalism's tithes (`city_split_trade`): the content the city's improvements make, before the unhappy cap, and
 *  J. S. Bach's 2 for its owner. Bach's content itself is civ2-wonder's.
 */
const tithes = (city, registries = {}) => exports.contents.reduce((total, content) => { var _a, _b; return total + ((_b = (_a = content(city, registries)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0); }, 0) + ((0, source_1.owns)(city.player(), Wonders_1.JsBachsCathedral, registries) ? rules_1.bachContent : 0);
exports.tithes = tithes;
//# sourceMappingURL=content.js.map