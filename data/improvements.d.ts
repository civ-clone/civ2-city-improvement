import Advance from '@civ-clone/core-science/Advance';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
/** An improvement's @IMPROVE row: its class, its cost in rows of shields, its upkeep in gold, and its advance. */
export type ImprovementRow = [
  Improvement: typeof CityImprovement,
  cost: number,
  upkeep: number,
  prerequisite: typeof Advance | null
];
export declare const improvements: ImprovementRow[];
export default improvements;
