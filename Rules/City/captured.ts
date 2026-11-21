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
import cancelSpaceship from '@civ-clone/base-spaceship/lib/cancelSpaceship';
import { instance as spaceshipRegistryInstance } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { founderOf } from '@civ-clone/civ2-city/lib/founder';
import isHuman from '@civ-clone/civ2-difficulty/isHuman';
import { captureKeepOddRowsChance, palaceEscapeCost } from '../../data/rules';
import Description from '@civ-clone/core-rule/Description';
import { instance as rngInstance } from '@civ-clone/core-random';
import { Gold } from '../../Yields';
import { withDefaults } from '../../lib/source';

/** Lost when a city is taken by anyone but its founder (OpenCiv2 `city_capture_aftermath`). */
export const lostOnCapture: (typeof CityImprovement)[] = [
  Palace,
  Temple,
  Cathedral,
  Courthouse,
];

/** Those `lostOnCapture` that the `lost` rule takes: the Palace goes by a rule of its own. */
const lostWithTheCity = lostOnCapture.filter(
  (Improvement) => Improvement !== Palace
);

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
    {
      clientRegistry = clientRegistryInstance,
      spaceshipRegistry = spaceshipRegistryInstance,
    } = dependencies,
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
        // A civil war that couldn't break out leaves no escape (`lib/capital`'s `barPalaceEscape`), and has lost the
        //  ship itself. Asked here, not as a `Criterion`: every rule's criteria are asked before any effect runs, and
        //  the civil war's is an effect.
        if (palaceEscapeBarred(city)) {
          return;
        }

        // Whenever the Palace isn't saved, the spaceship is lost (`civ_spaceship_lost_notify`, city.cpp ~4819).
        const loseShip = (): void => cancelSpaceship(loser, spaceshipRegistry);

        if (!isHuman(loser, clientRegistry)) {
          const escape = palaceEscape(city, loser, dependencies);

          if (escape === null) {
            loseShip();

            return;
          }

          escapeTo(escape, loser, dependencies);

          return;
        }

        if (goldOf(loser, dependencies) < palaceEscapeCost) {
          loseShip();

          return;
        }

        const escape = palaceEscapeCandidate(city, loser, dependencies);

        if (escape === null) {
          loseShip();

          return;
        }

        askPalaceEscape(city, loser, escape, dependencies).then(
          (saved: boolean): void => {
            if (!saved) {
              loseShip();
            }
          },
          loseShip
        );
      }),
      // Its conditions (the city's size, the difficulty, the owner's cities and gold) are left to the code.
      new Description({
        type: 'palace_escape',
        subject: Palace,
        value: palaceEscapeCost,
        yield: Gold,
      })
    ),

    new Captured(
      'civ2-city-improvement:city/captured/palace',
      new Effect((city: City): void =>
        standing(city)
          .filter((improvement) => improvement instanceof Palace)
          .forEach((palace) => palace.destroy())
      ),
      new Description({ type: 'lost_on_capture', subject: Palace })
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
          const keepOdd = randomNumberGenerator() < captureKeepOddRowsChance;

          standing(city)
            .filter(
              (improvement) =>
                (rowOf.get(improvement.constructor) ?? 0) % 2 ===
                (keepOdd ? 0 : 1)
            )
            .forEach((improvement) => improvement.destroy());
        }
      ),
      // Taken by anyone but the founder: these always, and on a conquest each of the rest at even odds (an odd row's is
      //  lost when the even rows are kept, and so the other way round).
      new Description(
        ...lostWithTheCity.map((Improvement) => ({
          type: 'lost_on_capture',
          subject: Improvement,
          unless: 'founder',
        })),
        ...improvements
          .filter(
            ([Improvement]) =>
              Improvement !== Palace && !lostOnCapture.includes(Improvement)
          )
          .map(([Improvement]) => ({
            type: 'lost_on_capture',
            subject: Improvement,
            unless: 'founder',
            value:
              rowOf.get(Improvement)! % 2 === 0
                ? captureKeepOddRowsChance
                : 1 - captureKeepOddRowsChance,
          }))
      )
    ),
  ];
};

export default getRules;
