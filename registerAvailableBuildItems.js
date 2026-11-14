"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const improvements_1 = require("./data/improvements");
/** Civilization II's 34 improvements, in @IMPROVE order, as a city's build list. */
const register = (availableCityBuildItems) => availableCityBuildItems.register(...improvements_1.default.map(([Improvement]) => Improvement));
exports.register = register;
exports.default = exports.register;
//# sourceMappingURL=registerAvailableBuildItems.js.map