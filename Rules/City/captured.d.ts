import { CapitalDependencies } from '../../lib/capital';
import Captured from '@civ-clone/core-city/Rules/Captured';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
/** Lost when a city is taken by anyone but its founder (OpenCiv2 `city_capture_aftermath`). */
export declare const lostOnCapture: (typeof CityImprovement)[];
export declare const getRules: (
  dependencies?: CapitalDependencies,
  randomNumberGenerator?: () => number
) => Captured[];
export default getRules;
