import { buildRequirements, describedRequirements } from './Requirements';
import { notBuilt, siteRules, wonderExclusionRules } from './Rules/City/build';
import { Game, defaultGame } from '@civ-clone/core-game';
import { Registries } from './lib/source';
import cityBuildCost from './Rules/City/build-cost';
import cityBuildPriority from './Rules/City/build-priority';
import cityCapitalization from './Rules/City/capitalization';
import cityCaptured from './Rules/City/captured';
import cityCost from './Rules/City/cost';
import cityCreated from './Rules/City/created';
import cityDestroyed from './Rules/City/destroyed';
import cityGrow from './Rules/City/grow';
import cityImprovementCreated from './Rules/CityImprovement/created';
import cityMeltdown from './Rules/City/meltdown';
import cityPollution from './Rules/City/pollution';
import cityPollutionDivisor from './Rules/City/pollution-divisor';
import cityTileYield from './Rules/City/tile-yield';
import cityYield from './Rules/City/yield';
import cityYieldModifier from './Rules/City/yield-modifier';
import globalWarming from './Rules/Turn/global-warming';
import { deriveBuildRules } from '@civ-clone/base-city-improvement-rules/lib/build';
import playerResearchComplete from './Rules/Player/research-complete';
import registerAvailableBuildItems from './registerAvailableBuildItems';
import unitCreated from './Rules/Unit/created';
import unitStrength from './Rules/Unit/strength';

export const register = (game: Game): void => {
  const registries: Registries = {
      cityImprovementRegistry: game.cityImprovements,
      wonderRegistry: game.wonders,
      playerResearchRegistry: game.playerResearch,
      requirementRegistry: game.requirements,
    },
    dependencies = {
      ...registries,
      cityGrowthRegistry: game.cityGrowth,
      cityRegistry: game.cities,
      clientRegistry: game.clients,
      engine: game.engine,
      gameDifficultyRegistry: game.difficulty,
      interactionRegistry: game.interactions,
      landMassRegistry: game.landMasses,
      pendingEffectRegistry: game.pendingEffects,
      playerRegistry: game.players,
      playerGovernmentRegistry: game.playerGovernments,
      playerTreasuryRegistry: game.playerTreasuries,
      randomNumberGenerator: game.rng,
      ruleRegistry: game.rules,
      spaceshipRegistry: game.spaceships,
      tileImprovementRegistry: game.tileImprovements,
      turn: game.turn,
      unitRegistry: game.units,
    };

  registerAvailableBuildItems(game.availableCityBuildItems);

  game.rules.register(notBuilt(game.cityImprovements));

  // Which improvements a city may build, from the entries in `Requirements`, so a plugin can change an entry and its
  //  rule together.
  game.requirements.add(
    deriveBuildRules(game.cityImprovements, game.playerResearch),
    ...buildRequirements
  );
  game.requirements.add(null, ...describedRequirements);

  game.rules.register(
    ...siteRules(game.terrainFeatures),
    ...wonderExclusionRules(registries),
    ...cityBuildCost(),
    ...cityBuildPriority(dependencies),
    ...cityCapitalization(),
    ...cityCaptured(dependencies, game.rng),
    ...cityCost(dependencies),
    ...cityCreated(game.cities, game.cityImprovements, game.rules),
    ...cityDestroyed(game.cityImprovements),
    ...cityGrow(registries),
    ...cityPollution(dependencies),
    ...cityMeltdown(dependencies),
    ...cityPollutionDivisor(registries),
    ...cityImprovementCreated(game.cityImprovements, game.engine),
    ...cityTileYield(dependencies),
    ...cityYield(dependencies),
    ...cityYieldModifier(registries),
    ...playerResearchComplete(
      game.cityImprovements,
      game.cities,
      game.engine,
      game.playerTreasuries
    ),
    ...unitCreated(game.unitImprovements, game.rules, registries),
    ...unitStrength(game.cities, game.cityImprovements),
    ...globalWarming({
      cityImprovementRegistry: game.cityImprovements,
      cityRegistry: game.cities,
      clientRegistry: game.clients,
      engine: game.engine,
      pendingEffectRegistry: game.pendingEffects,
      ruleRegistry: game.rules,
      tileImprovementRegistry: game.tileImprovements,
      turn: game.turn,
    })
  );
};

// The plugin loader imports each package for this side effect. Until it passes a `Game` of its own, dropping it would
//  produce a game with silently absent rules: no error, just wrong behaviour.
register(defaultGame);

export default register;
