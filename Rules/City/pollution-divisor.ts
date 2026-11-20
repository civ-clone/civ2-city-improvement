import {
  HydroPlant,
  NuclearPlant,
  RecyclingCenter,
  SolarPlant,
} from '../../CityImprovements';
import { Registries, hasEither } from '../../lib/source';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import { HooverDam } from '../../Wonders';
import PollutionDivisor from '@civ-clone/base-city-pollution/Rules/PollutionDivisor';
import Wonder from '@civ-clone/core-wonder/Wonder';

// OpenCiv2 `city_calc_shields_pollution` (richardpenman/civ2@49f26ec): a Hydro or Nuclear Plant (or the Hoover Dam)
//  halves the shields that count towards pollution, and a Recycling Center or a Solar Plant thirds them; the largest
//  counts.
//  A Solar Plant's row is said nowhere: it takes the shields out of the pollution altogether (`lib/pollution`), which
//  `Rules/City/pollution` says.
export const divisors: [
  typeof CityImprovement,
  typeof Wonder | null,
  number
][] = [
  [HydroPlant, HooverDam, 2],
  [NuclearPlant, null, 2],
  [RecyclingCenter, null, 3],
  [SolarPlant, null, 3],
];

export const getRules = (registries: Registries = {}): PollutionDivisor[] =>
  divisors.map(
    ([Improvement, WonderType, divisor]): PollutionDivisor =>
      new PollutionDivisor(
        `civ2-city-improvement:city/pollution-divisor/${Improvement.name}`,
        new Criterion((city: City): boolean =>
          hasEither(city, Improvement, WonderType, registries)
        ),
        new Effect((): number => divisor),
        new Description(
          ...(Improvement === SolarPlant
            ? []
            : [
                {
                  type: 'pollution_divisor',
                  subject: Improvement,
                  value: divisor,
                  // The largest divisor counts.
                  notWith: divisors
                    .map(([Other]) => Other)
                    .filter(
                      (Other) => Other !== Improvement && Other !== SolarPlant
                    ),
                },
              ]),
          ...(WonderType === null
            ? []
            : [
                {
                  type: 'acts_as',
                  subject: WonderType,
                  improvement: Improvement,
                  scope: 'player',
                },
              ])
        )
      )
  );

export default getRules;
