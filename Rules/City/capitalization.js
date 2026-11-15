"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const capitalizationRules_1 = require("@civ-clone/base-city-improvement-capitalization/lib/capitalizationRules");
const options = { idPrefix: 'civ2-city-improvement' };
/**
 * Capitalization (base-city-improvement-capitalization), as OpenCiv2 has it (`src/auto/city_production.cpp`
 *  `city_process_production`, richardpenman/civ2@49f26ec): it costs nothing and never completes, and a city that builds
 *  it moves on to what's queued after it. Its conversion rule isn't registered: civ2-city's production step pays the
 *  turn's production out as gold instead of adding it to the build (`payOut`), so the shields in the box stay there,
 *  frozen, as `city_process_production` leaves them.
 */
const getRules = () => [
    ...(0, capitalizationRules_1.capitalizationCost)(options),
    ...(0, capitalizationRules_1.capitalizationHold)(options),
    ...(0, capitalizationRules_1.capitalizationQueue)(options),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=capitalization.js.map