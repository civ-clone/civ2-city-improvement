import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  Farmland,
  Fortress,
  Irrigation,
  Mine,
  Pollution,
  Railroad,
} from '@civ-clone/civ2-world/TileImprovements';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { NuclearPlant } from '../CityImprovements';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import { instance as rngInstance } from '@civ-clone/core-random';

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
export const meltdownOdds = (level: number): number =>
  1 / Math.max(6 - level, 1);

/**
 * OpenCiv2's `nuclear_blast` (`src/auto/unit.cpp` ~5095, richardpenman/civ2@49f26ec), over `tile` and the 8 squares
 *  around it. It destroys no units (a nuclear attack does that itself, before its blast):
 *
 * - a city loses half its size, rounded down (`size -= size >> 1`);
 * - on land without a city, a Fortress is lost (not an Airbase), and on a roll of 1 in 2 each: the railroad; on
 *   farmland the farmland (the mine bit, leaving the irrigation), or else the mine and the irrigation, a roll each;
 *   then fallout 2 times in 3 (`rand() % 3 != 0`).
 */
export const nuclearBlast = (
  tile: Tile,
  cause: unknown,
  {
    cityGrowthRegistry = cityGrowthRegistryInstance,
    cityRegistry = cityRegistryInstance,
    randomNumberGenerator = rngInstance,
    ruleRegistry = ruleRegistryInstance,
    tileImprovementRegistry = tileImprovementRegistryInstance,
  }: MeltdownDependencies = {}
): void => {
  const onTile = (
      square: Tile,
      Type: typeof TileImprovement
    ): TileImprovement[] =>
      tileImprovementRegistry.getByTile(square).filter(
        (improvement: TileImprovement): boolean =>
          improvement instanceof Type &&
          // An Airbase is Civ2's Fortress bit and city bit together: only a Fortress alone is lost.
          !(Type === Fortress && improvement.constructor !== Fortress)
      ),
    remove = (square: Tile, Type: typeof TileImprovement): void =>
      onTile(square, Type).forEach((improvement: TileImprovement): void => {
        ruleRegistry.process(Removed, square, improvement);
      }),
    halfTheTime = (): boolean => randomNumberGenerator() < 1 / 2;

  [tile, ...tile.getNeighbours()].forEach((square: Tile): void => {
    const city = cityRegistry.getByTile(square);

    if (city !== null) {
      const cityGrowth = cityGrowthRegistry.getByCity(city),
        loss = cityGrowth.size() >> 1;

      for (let i = 0; i < loss; i++) {
        cityGrowth.shrink(cause);
      }

      return;
    }

    if (!square.isLand()) {
      return;
    }

    remove(square, Fortress);

    if (halfTheTime()) {
      remove(square, Railroad);
    }

    if (onTile(square, Farmland).length === 0) {
      if (halfTheTime()) {
        remove(square, Mine);
      }

      if (halfTheTime()) {
        remove(square, Irrigation);
      }
    } else if (halfTheTime()) {
      remove(square, Farmland);
    }

    if (
      randomNumberGenerator() < 2 / 3 &&
      onTile(square, Pollution).length === 0
    ) {
      // Building it processes `Built`, which puts it on the tile.
      new Pollution(square, ruleRegistry);
    }
  });
};

/**
 * A Nuclear Plant's meltdown (`city_process_pollution`): the client is told (`city:nuclear-meltdown`, with the city),
 *  then `nuclearBlast` goes off over the city, and the plant is lost.
 */
export const meltdown = (
  city: City,
  dependencies: MeltdownDependencies = {}
): void => {
  const {
      cityImprovementRegistry = cityImprovementRegistryInstance,
      engine = engineInstance,
    } = dependencies,
    plants = cityImprovementRegistry
      .getByCity(city)
      .filter(
        (improvement: CityImprovement): boolean =>
          improvement instanceof NuclearPlant
      );

  engine.emit('city:nuclear-meltdown', city);

  nuclearBlast(city.tile(), plants[0] ?? null, dependencies);

  plants.forEach((plant: CityImprovement): void => plant.destroy());
};

export default meltdown;
