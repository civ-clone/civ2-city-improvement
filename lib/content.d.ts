import { Registries } from './source';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
/** What makes the city's citizens content (`source`), and how many it makes content, before the unhappy cap. */
export type Content = {
  source: CityImprovement;
  value: number;
};
/**
 * The content citizens of Civilization II's stage 2 (OpenCiv2 `src/auto/city.cpp` `city_calc_trade_happiness`,
 *  richardpenman/civ2@49f26ec), in its order:
 *  - a Colosseum, 3, and 1 more with Electronics;
 *  - with Monotheism, a Cathedral or Michelangelo's, 3, 1 fewer without Theology and 1 more without Communism;
 *  - a Temple, 1 with Ceremonial Burial and 1 with Mysticism, doubled by the Oracle.
 */
export declare const colosseum: (
  city: City,
  registries?: Registries
) => Content | null;
export declare const cathedral: (
  city: City,
  registries?: Registries
) => Content | null;
export declare const temple: (
  city: City,
  registries?: Registries
) => Content | null;
export declare const contents: ((
  city: City,
  registries?: Registries
) => Content | null)[];
/** The improvements `contents` asks about, in its order. */
export declare const contentImprovements: (typeof CityImprovement)[];
/** What each of `contents` does, for the Civilopedia (civ-clone/web-renderer#1196). */
export declare const contentDescriptions: Map<Function, EffectDescription[]>;
/**
 * Fundamentalism's tithes (`city_split_trade`): the content the city's improvements make, before the unhappy cap, and
 *  J. S. Bach's 2 for its owner. Bach's content itself is civ2-wonder's.
 */
export declare const tithes: (city: City, registries?: Registries) => number;
