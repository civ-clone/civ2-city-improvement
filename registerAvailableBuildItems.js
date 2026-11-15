"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const Capitalization_1 = require("@civ-clone/base-city-improvement-capitalization/Capitalization");
const improvements_1 = require("./data/improvements");
/** Civilization II's 34 improvements, in @IMPROVE order, and Capitalization (row 38), as a city's build list. */
const register = (availableCityBuildItems) => availableCityBuildItems.register(...improvements_1.default.map(([Improvement]) => Improvement), Capitalization_1.default);
exports.register = register;
exports.default = exports.register;
//# sourceMappingURL=registerAvailableBuildItems.js.map