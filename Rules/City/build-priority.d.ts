import { BuildPriorityDependencies } from '@civ-clone/base-city-improvement-rules/lib/buildPriority';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { UpkeepDependencies } from '../../lib/upkeep';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
/** How much a city with no capital in its player's empire wants the Palace back: above any other need but war. */
export declare const palacePriority = 20;
/**
 * A computer player's rules of thumb for which improvement a city builds, as civ1-city-improvement's (they follow the
 *  feel of the game, not its code) with Civilization II's size caps, and the Palace: a player that has lost its capital
 *  rebuilds it in its largest city, or corruption takes almost all of its trade (civ2-city).
 */
export declare const getRules: (
  dependencies?: BuildPriorityDependencies &
    UpkeepDependencies & {
      cityGrowthRegistry?: CityGrowthRegistry;
      cityRegistry?: CityRegistry;
    }
) => BuildPriority[];
export default getRules;
