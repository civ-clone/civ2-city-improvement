import { Cathedral, Colosseum, Temple } from '../CityImprovements';
import {
  CeremonialBurial,
  Communism,
  Electronics,
  Monotheism,
  Mysticism,
  Theology,
} from '@civ-clone/civ2-science/Advances';
import { JsBachsCathedral, MichelangelosChapel, Oracle } from '../Wonders';
import { Registries, owns, sourceOf, withDefaults } from './source';
import {
  bachContent,
  cathedralCommunismContent,
  cathedralContent,
  cathedralTheologyContent,
  colosseumContent,
  colosseumElectronicsContent,
  oracleMultiplier,
  templeContentPerAdvance,
} from '../data/rules';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

/** What makes the city's citizens content (`source`), and how many it makes content, before the unhappy cap. */
export type Content = { source: CityImprovement; value: number };

const knows = (city: City, Advance: Function, registries: Registries) =>
  withDefaults(registries)
    .playerResearchRegistry.getByPlayer(city.player())
    .completed(Advance as any);

/**
 * The content citizens of Civilization II's stage 2 (OpenCiv2 `src/auto/city.cpp` `city_calc_trade_happiness`,
 *  richardpenman/civ2@49f26ec), in its order:
 *  - a Colosseum, 3, and 1 more with Electronics;
 *  - with Monotheism, a Cathedral or Michelangelo's, 3, 1 fewer without Theology and 1 more without Communism;
 *  - a Temple, 1 with Ceremonial Burial and 1 with Mysticism, doubled by the Oracle.
 */
export const colosseum = (
  city: City,
  registries: Registries = {}
): Content | null => {
  const source = sourceOf(city, Colosseum, null, registries);

  return source === null
    ? null
    : {
        source,
        value:
          colosseumContent +
          (knows(city, Electronics, registries)
            ? colosseumElectronicsContent
            : 0),
      };
};

export const cathedral = (
  city: City,
  registries: Registries = {}
): Content | null => {
  if (!knows(city, Monotheism, registries)) {
    return null;
  }

  const source = sourceOf(city, Cathedral, MichelangelosChapel, registries);

  return source === null
    ? null
    : {
        source,
        value:
          cathedralContent -
          (knows(city, Theology, registries) ? 0 : cathedralTheologyContent) +
          (knows(city, Communism, registries) ? 0 : cathedralCommunismContent),
      };
};

export const temple = (
  city: City,
  registries: Registries = {}
): Content | null => {
  const source = sourceOf(city, Temple, null, registries);

  if (source === null) {
    return null;
  }

  const value =
    (knows(city, Mysticism, registries) ? templeContentPerAdvance : 0) +
    (knows(city, CeremonialBurial, registries) ? templeContentPerAdvance : 0);

  return {
    source,
    value: owns(city.player(), Oracle, registries)
      ? value * oracleMultiplier
      : value,
  };
};

export const contents = [colosseum, cathedral, temple];

/** The improvements `contents` asks about, in its order. */
export const contentImprovements: (typeof CityImprovement)[] = [
  Colosseum,
  Cathedral,
  Temple,
];

/** What each of `contents` does, for the Civilopedia (civ-clone/web-renderer#1196). */
export const contentDescriptions = new Map<Function, EffectDescription[]>([
  [
    colosseum,
    [
      { type: 'content', subject: Colosseum, value: colosseumContent },
      {
        type: 'content',
        subject: Colosseum,
        value: colosseumElectronicsContent,
        step: 'more',
        with: [Electronics],
      },
    ],
  ],
  [
    cathedral,
    [
      {
        type: 'content',
        subject: Cathedral,
        value: cathedralContent,
        with: [Monotheism],
      },
      {
        type: 'content',
        subject: Cathedral,
        value: cathedralTheologyContent,
        step: 'fewer',
        until: Theology,
      },
      {
        type: 'content',
        subject: Cathedral,
        value: cathedralCommunismContent,
        step: 'more',
        until: Communism,
      },
      {
        type: 'acts_as',
        subject: MichelangelosChapel,
        improvement: Cathedral,
        scope: 'player',
      },
    ],
  ],
  [
    temple,
    [
      {
        type: 'content',
        subject: Temple,
        value: templeContentPerAdvance,
        with: [CeremonialBurial],
      },
      {
        type: 'content',
        subject: Temple,
        value: templeContentPerAdvance,
        step: 'more',
        with: [Mysticism],
      },
      {
        type: 'content_multiplier',
        subject: Oracle,
        value: oracleMultiplier,
        inCitiesWith: [Temple],
        scope: 'player',
      },
    ],
  ],
]);

/**
 * Fundamentalism's tithes (`city_split_trade`): the content the city's improvements make, before the unhappy cap, and
 *  J. S. Bach's 2 for its owner. Bach's content itself is civ2-wonder's.
 */
export const tithes = (city: City, registries: Registries = {}): number =>
  contents.reduce(
    (total: number, content): number =>
      total + (content(city, registries)?.value ?? 0),
    0
  ) + (owns(city.player(), JsBachsCathedral, registries) ? bachContent : 0);
