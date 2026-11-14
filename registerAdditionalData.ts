import { Game, defaultGame } from '@civ-clone/core-game';
import growthLimit from './AdditionalData/growthLimit';
import pollution from './AdditionalData/pollution';

export const register = (game: Game): void =>
  game.additionalData.register(
    ...growthLimit(game.cityImprovements),
    ...pollution(
      {
        cityImprovementRegistry: game.cityImprovements,
        wonderRegistry: game.wonders,
        playerResearchRegistry: game.playerResearch,
        requirementRegistry: game.requirements,
      },
      game.rules,
      game.cityGrowth
    )
  );

// Imported for this side effect, as `registerRules` is.
register(defaultGame);

export default register;
