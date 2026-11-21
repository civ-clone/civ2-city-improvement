"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Engine_1 = require("@civ-clone/core-engine/Engine");
const CityImprovements_1 = require("../../CityImprovements");
const created_1 = require("@civ-clone/base-city-improvement-rules/lib/created");
const described_1 = require("../../lib/described");
// A new improvement is registered; a new Palace moves the capital, destroying the player's old one; and the engine is
//  told. The move says so of the Palace.
const getRules = (cityImprovementRegistry = CityImprovementRegistry_1.instance, engine = Engine_1.instance) => (0, created_1.default)({ cityImprovementRegistry, engine }, { Capital: CityImprovements_1.Palace, idPrefix: 'civ2-city-improvement' }).map((rule) => rule.id() ===
    'civ2-city-improvement:city-improvement/created/move-capital'
    ? (0, described_1.default)(rule, { type: 'relocates', subject: CityImprovements_1.Palace })
    : rule);
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map