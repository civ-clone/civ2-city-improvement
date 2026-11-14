import {
  BuildCost,
  buildCost,
} from '@civ-clone/core-city-build/Rules/BuildCost';
import Buildable from '@civ-clone/core-city-build/Buildable';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import improvements from '../../data/improvements';

/** Each improvement's cost in shields: @IMPROVE's rows of shields, times @COSMIC's shield box rows (10). */
export const getRules = (): BuildCost[] =>
  improvements.flatMap(([Improvement, cost]) =>
    buildCost(
      Improvement as unknown as typeof Buildable,
      cost * cosmic.shieldBoxRows,
      'civ2-city-improvement:city/build-cost'
    )
  );

export default getRules;
