import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { Engine } from '@civ-clone/core-engine/Engine';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
export interface MeltdownDependencies {
  cityGrowthRegistry?: CityGrowthRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  engine?: Engine;
  randomNumberGenerator?: () => number;
  ruleRegistry?: RuleRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
}
/** A Nuclear Plant melts down 1 time in (6 − level) (`city_process_pollution`): 1 in 6 on Chieftain, always on Deity. */
export declare const meltdownOdds: (level: number) => number;
/**
 * OpenCiv2's `nuclear_blast` (`src/auto/unit.cpp` ~5095, richardpenman/civ2@49f26ec), over `tile` and the 8 squares
 *  around it. It destroys no units (a nuclear attack does that itself, before its blast):
 *
 * - a city loses half its size, rounded down (`size -= size >> 1`);
 * - on land without a city, a Fortress is lost (not an Airbase), and on a roll of 1 in 2 each: the railroad; on
 *   farmland the farmland (the mine bit, leaving the irrigation), or else the mine and the irrigation, a roll each;
 *   then fallout 2 times in 3 (`rand() % 3 != 0`).
 */
export declare const nuclearBlast: (
  tile: Tile,
  cause: unknown,
  {
    cityGrowthRegistry,
    cityRegistry,
    randomNumberGenerator,
    ruleRegistry,
    tileImprovementRegistry,
  }?: MeltdownDependencies
) => void;
/**
 * A Nuclear Plant's meltdown (`city_process_pollution`): the client is told (`city:nuclear-meltdown`, with the city),
 *  then `nuclearBlast` goes off over the city, and the plant is lost.
 */
export declare const meltdown: (
  city: City,
  dependencies?: MeltdownDependencies
) => void;
export default meltdown;
