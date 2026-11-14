"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tithes = exports.contents = exports.temple = exports.cathedral = exports.colosseum = void 0;
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
            value: rules_1.colosseumContent + (knows(city, Advances_1.Electronics, registries) ? 1 : 0),
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
                (knows(city, Advances_1.Theology, registries) ? 0 : 1) +
                (knows(city, Advances_1.Communism, registries) ? 0 : 1),
        };
};
exports.cathedral = cathedral;
const temple = (city, registries = {}) => {
    const source = (0, source_1.sourceOf)(city, CityImprovements_1.Temple, null, registries);
    if (source === null) {
        return null;
    }
    const value = (knows(city, Advances_1.Mysticism, registries) ? 1 : 0) +
        (knows(city, Advances_1.CeremonialBurial, registries) ? 1 : 0);
    return {
        source,
        value: (0, source_1.owns)(city.player(), Wonders_1.Oracle, registries) ? value * 2 : value,
    };
};
exports.temple = temple;
exports.contents = [exports.colosseum, exports.cathedral, exports.temple];
/**
 * Fundamentalism's tithes (`city_split_trade`): the content the city's improvements make, before the unhappy cap, and
 *  J. S. Bach's 2 for its owner. Bach's content itself is civ2-wonder's.
 */
const tithes = (city, registries = {}) => exports.contents.reduce((total, content) => { var _a, _b; return total + ((_b = (_a = content(city, registries)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0); }, 0) + ((0, source_1.owns)(city.player(), Wonders_1.JsBachsCathedral, registries) ? rules_1.bachContent : 0);
exports.tithes = tithes;
//# sourceMappingURL=content.js.map