import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import Complete from '@civ-clone/core-science/Rules/Complete';
export declare const getRules: (
  cityImprovementRegistry?: CityImprovementRegistry,
  cityRegistry?: CityRegistry,
  engine?: Engine,
  playerTreasuryRegistry?: PlayerTreasuryRegistry
) => Complete[];
export default getRules;
