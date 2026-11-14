import { CapitalDependencies, escapeTo, palaceEscape } from '../../lib/capital';
import { Cathedral, Courthouse, Palace, Temple } from '../../CityImprovements';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import improvements from '../../data/improvements';
import { instance as rngInstance } from '@civ-clone/core-random';
import { withDefaults } from '../../lib/source';

/** Lost when a city is taken by anyone but its founder (OpenCiv2 `city_capture_aftermath`). */
export const lostOnCapture: (typeof CityImprovement)[] = [
  Palace,
  Temple,
  Cathedral,
  Courthouse,
];

const rowOf = new Map<Function, number>(
  improvements.map(([Improvement], index) => [Improvement, index + 1])
);

const isFounder = (city: City, capturer: Player): boolean =>
  city.originalPlayer() === capturer;

// OpenCiv2 `src/auto/city.cpp` `city_capture_aftermath` (richardpenman/civ2@49f26ec), in its order:
//  - a computer player that loses its capital may buy the Palace into another city (`lib/capital`);
//  - the Palace is lost (Civ2 leaves the bit on a city its founder retakes, which would give the founder a second
//    capital: here it's always lost);
//  - taken by anyone but its founder, the city loses its Temple, Cathedral and Courthouse, and then every improvement in
//    an odd @IMPROVE row, or every one in an even row, on one roll. Wonders aren't improvements here.
export const getRules = (
  dependencies: CapitalDependencies = {},
  randomNumberGenerator: () => number = rngInstance
): Captured[] => {
  const { cityImprovementRegistry } = withDefaults(dependencies),
    standing = (city: City): CityImprovement[] =>
      cityImprovementRegistry
        .getByCity(city)
        .filter((improvement) => !(improvement instanceof Wonder));

  return [
    new Captured(
      'civ2-city-improvement:city/captured/palace-escape',
      new Criterion((city: City): boolean =>
        standing(city).some((improvement) => improvement instanceof Palace)
      ),
      new Effect((city: City, capturer: Player, loser: Player): void => {
        const escape = palaceEscape(city, loser, dependencies);

        if (escape !== null) {
          escapeTo(escape, loser, dependencies);
        }
      })
    ),

    new Captured(
      'civ2-city-improvement:city/captured/palace',
      new Effect((city: City): void =>
        standing(city)
          .filter((improvement) => improvement instanceof Palace)
          .forEach((palace) => palace.destroy())
      )
    ),

    new Captured(
      'civ2-city-improvement:city/captured/lost',
      new Criterion(
        (city: City, capturer: Player): boolean => !isFounder(city, capturer)
      ),
      new Effect((city: City): void => {
        standing(city)
          .filter((improvement) =>
            lostOnCapture.some((Lost) => improvement instanceof Lost)
          )
          .forEach((improvement) => improvement.destroy());

        // `0xaa >> (rand & 1)`: odd rows are kept, or even ones.
        const keepOdd = randomNumberGenerator() < 0.5;

        standing(city)
          .filter(
            (improvement) =>
              (rowOf.get(improvement.constructor) ?? 0) % 2 ===
              (keepOdd ? 0 : 1)
          )
          .forEach((improvement) => improvement.destroy());
      })
    ),
  ];
};

export default getRules;
