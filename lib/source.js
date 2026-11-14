"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasEither = exports.sourceOf = exports.owns = exports.withDefaults = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const RequirementRegistry_1 = require("@civ-clone/core-requirement/RequirementRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
const hasWonder_1 = require("@civ-clone/base-wonder/lib/hasWonder");
/** `registries` with every one filled in from the singletons. */
const withDefaults = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, requirementRegistry = RequirementRegistry_1.instance, } = {}) => ({
    cityImprovementRegistry,
    wonderRegistry,
    playerResearchRegistry,
    requirementRegistry,
});
exports.withDefaults = withDefaults;
/** Whether `player` owns a standing `WonderType` that isn't obsolete (base-wonder's `playerOwnsWonder`). */
const owns = (player, WonderType, registries = {}) => {
    const { wonderRegistry, playerResearchRegistry, requirementRegistry } = (0, exports.withDefaults)(registries);
    return (0, hasWonder_1.playerOwnsWonder)(player, WonderType, wonderRegistry, playerResearchRegistry, requirementRegistry);
};
exports.owns = owns;
/**
 * What gives `city` the effect Civilization II tests as "improvement or Wonder": its `Improvement`, or else its
 * player's standing, unobsolete `WonderType`, or `null`. One answer, so the two never stack (base-wonder's
 * `cityHasImprovementOrWonder` asks the same question).
 */
const sourceOf = (city, Improvement, WonderType, registries = {}) => {
    var _a;
    const { cityImprovementRegistry, wonderRegistry } = (0, exports.withDefaults)(registries), improvement = (0, has_1.improvementOf)(city, Improvement, cityImprovementRegistry);
    if (improvement !== null || WonderType === null) {
        return improvement;
    }
    if (!(0, exports.owns)(city.player(), WonderType, registries)) {
        return null;
    }
    return ((_a = wonderRegistry
        .getByPlayer(city.player())
        .find((wonder) => wonder instanceof WonderType)) !== null && _a !== void 0 ? _a : null);
};
exports.sourceOf = sourceOf;
/** Whether `city` has `Improvement` or its player the Wonder that acts as one. */
const hasEither = (city, Improvement, WonderType, registries = {}) => (0, exports.sourceOf)(city, Improvement, WonderType, registries) !== null;
exports.hasEither = hasEither;
//# sourceMappingURL=source.js.map