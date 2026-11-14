import { Registries } from './source';
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
