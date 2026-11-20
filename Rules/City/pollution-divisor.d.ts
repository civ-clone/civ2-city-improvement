import { Registries } from '../../lib/source';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import PollutionDivisor from '@civ-clone/base-city-pollution/Rules/PollutionDivisor';
import Wonder from '@civ-clone/core-wonder/Wonder';
export declare const divisors: [
  typeof CityImprovement,
  typeof Wonder | null,
  number
][];
export declare const getRules: (registries?: Registries) => PollutionDivisor[];
export default getRules;
