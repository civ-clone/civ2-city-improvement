import {
  PalaceEscapeChoiceDependencies,
  askPalaceEscape,
} from '../../lib/palaceEscapeChoice';
import {
  escapeTo,
  goldOf,
  palaceEscape,
  palaceEscapeBarred,
  palaceEscapeCandidate,
} from '../../lib/capital';
import { Cathedral, Courthouse, Palace, Temple } from '../../CityImprovements';
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import improvements from '../../data/improvements';
import { instance as clientRegistryInstance } from '@civ-clone/core-client/ClientRegistry';
import { founderOf } from '@civ-clone/civ2-city/lib/founder';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { palaceEscapeCost } from '../../data/rules';
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

// OpenCiv2 `src/auto/city.cpp` `city_capture_aftermath` (richardpenman/civ2@49f26ec), in its order:
//  - a player that loses its capital may buy the Palace into another city for 1000 gold (`lib/capital`): a computer
//    player decides by itself, a person's client is asked, and plunder waits for the answer (`lib/palaceEscapeChoice`);
//  - the Palace is lost (Civ2 leaves the bit on a city its founder retakes, which would give the founder a second
//    capital: here it's always lost);
//  - taken by anyone but its founder, the city loses its Temple, Cathedral and Courthouse, and then, conquered rather
//    than incited, every improvement in an odd @IMPROVE row, or every one in an even row, on one roll. Wonders aren't
//    improvements here. The founder is civ2-city's (`lib/founder`, `was_founder` ~5440): the loser of the city's last
//    capture, or whoever has held it 63 turns since, read before civ2-city records this capture.
export const getRules = (
  dependencies: PalaceEscapeChoiceDependencies = {},
  randomNumberGenerator: () => number = rngInstance
): Captured[] => {
  const { cityImprovementRegistry } = withDefaults(dependencies),
    { clientRegistry = clientRegistryInstance } = dependencies,
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
      // A civil war that couldn't break out leaves no escape (`lib/capital`'s `barPalaceEscape`).
      new Criterion((city: City): boolean => !palaceEscapeBarred(city)),
      new Effect((city: City, capturer: Player, loser: Player): void => {
        if (!isHuman(loser, clientRegistry)) {
          const escape = palaceEscape(city, loser, dependencies);

          if (escape !== null) {
            escapeTo(escape, loser, dependencies);
          }

          return;
        }

        if (goldOf(loser, dependencies) < palaceEscapeCost) {
          return;
        }

        const escape = palaceEscapeCandidate(city, loser, dependencies);

        if (escape !== null) {
          askPalaceEscape(city, loser, escape, dependencies);
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
        (city: City, capturer: Player, loser: Player): boolean =>
          founderOf(city, loser, dependencies) !== capturer
      ),
      new Effect(
        (city: City, capturer: Player, loser: Player, cause: unknown): void => {
          standing(city)
            .filter((improvement) =>
              lostOnCapture.some((Lost) => improvement instanceof Lost)
            )
            .forEach((improvement) => improvement.destroy());

          // Only a conquest rolls: a city a Diplomat or Spy incites keeps the rest.
          if (cause instanceof InciteRevolt) {
            return;
          }

          // One roll decides whether the odd rows are kept or the even ones.
          const keepOdd = randomNumberGenerator() < 0.5;

          standing(city)
            .filter(
              (improvement) =>
                (rowOf.get(improvement.constructor) ?? 0) % 2 ===
                (keepOdd ? 0 : 1)
            )
            .forEach((improvement) => improvement.destroy());
        }
      )
    ),
  ];
};

export default getRules;
