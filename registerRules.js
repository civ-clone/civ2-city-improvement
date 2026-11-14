"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const Requirements_1 = require("./Requirements");
const build_1 = require("./Rules/City/build");
const core_game_1 = require("@civ-clone/core-game");
const build_cost_1 = require("./Rules/City/build-cost");
const build_priority_1 = require("./Rules/City/build-priority");
const captured_1 = require("./Rules/City/captured");
const cost_1 = require("./Rules/City/cost");
const created_1 = require("./Rules/City/created");
const destroyed_1 = require("./Rules/City/destroyed");
const grow_1 = require("./Rules/City/grow");
const created_2 = require("./Rules/CityImprovement/created");
const pollution_1 = require("./Rules/City/pollution");
const pollution_divisor_1 = require("./Rules/City/pollution-divisor");
const yield_1 = require("./Rules/City/yield");
const yield_modifier_1 = require("./Rules/City/yield-modifier");
const build_2 = require("@civ-clone/base-city-improvement-rules/lib/build");
const research_complete_1 = require("./Rules/Player/research-complete");
const registerAvailableBuildItems_1 = require("./registerAvailableBuildItems");
const created_3 = require("./Rules/Unit/created");
const strength_1 = require("./Rules/Unit/strength");
const register = (game) => {
    const registries = {
        cityImprovementRegistry: game.cityImprovements,
        wonderRegistry: game.wonders,
        playerResearchRegistry: game.playerResearch,
        requirementRegistry: game.requirements,
    }, dependencies = {
        ...registries,
        cityGrowthRegistry: game.cityGrowth,
        cityRegistry: game.cities,
        clientRegistry: game.clients,
        engine: game.engine,
        gameDifficultyRegistry: game.difficulty,
        interactionRegistry: game.interactions,
        playerGovernmentRegistry: game.playerGovernments,
        playerTreasuryRegistry: game.playerTreasuries,
        randomNumberGenerator: game.rng,
        ruleRegistry: game.rules,
        tileImprovementRegistry: game.tileImprovements,
        unitRegistry: game.units,
    };
    (0, registerAvailableBuildItems_1.default)(game.availableCityBuildItems);
    game.rules.register((0, build_1.notBuilt)(game.cityImprovements));
    // Which improvements a city may build, from the entries in `Requirements`, so a plugin can change an entry and its
    //  rule together.
    game.requirements.add((0, build_2.deriveBuildRules)(game.cityImprovements, game.playerResearch), ...Requirements_1.buildRequirements);
    game.requirements.add(null, ...Requirements_1.describedRequirements);
    game.rules.register(...(0, build_1.siteRules)(game.terrainFeatures), ...(0, build_1.wonderExclusionRules)(registries), ...(0, build_cost_1.default)(), ...(0, build_priority_1.default)(dependencies), ...(0, captured_1.default)(dependencies, game.rng), ...(0, cost_1.default)(dependencies), ...(0, created_1.default)(game.cities, game.cityImprovements, game.rules), ...(0, destroyed_1.default)(game.cityImprovements), ...(0, grow_1.default)(registries), ...(0, pollution_1.default)(dependencies), ...(0, pollution_divisor_1.default)(registries), ...(0, created_2.default)(game.cityImprovements, game.engine), ...(0, yield_1.default)(dependencies), ...(0, yield_modifier_1.default)(registries), ...(0, research_complete_1.default)(game.cityImprovements, game.cities, game.engine, game.playerTreasuries), ...(0, created_3.default)(game.unitImprovements, game.rules, registries), ...(0, strength_1.default)(game.cities, game.cityImprovements));
};
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes a `Game` of its own, dropping it would
//  produce a game with silently absent rules: no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map