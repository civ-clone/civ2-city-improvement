import {
  Airbase,
  Farmland,
  Fortress,
  Irrigation,
  Mine,
  Pollution,
  Railroad,
} from '@civ-clone/civ2-world/TileImprovements';
import { atLevel, built, cityOf, governedBy, playedBy } from './lib/stubs';
import { meltdownOdds, nuclearBlast } from '../lib/meltdown';
import Built from '@civ-clone/core-tile-improvement/Rules/Built';
import City from '@civ-clone/core-city/City';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import Effect from '@civ-clone/core-rule/Effect';
import { FusionPower } from '@civ-clone/civ2-science/Advances';
import { NuclearPlant } from '../CityImprovements';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Production } from '../Yields';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import LuxuryHappiness from '@civ-clone/base-city-yield-luxury-happiness/LuxuryHappiness';
import { Monarchy } from '@civ-clone/civ2-government/Governments';
import PopulationUnhappiness from '@civ-clone/base-city-yield-population-unhappiness/PopulationUnhappiness';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';
import happinessDisorder from '@civ-clone/civ2-city-happiness/Rules/City/civil-disorder';
import meltdownRules from '../Rules/City/meltdown';

const setUp = (rolls: number[] = []) => {
  const ruleRegistry = new RuleRegistry(),
    onTiles = new Map<Tile, TileImprovement[]>(),
    sizes = new Map<City, number>(),
    cities = new Map<Tile, City>(),
    land = (): Tile => ({ isLand: () => true } as unknown as Tile),
    sea = { isLand: () => false } as unknown as Tile,
    neighbours = [land(), land(), land(), land(), land(), land(), land(), sea],
    centre = {
      isLand: () => true,
      getNeighbours: () => neighbours,
    } as unknown as Tile,
    queue = [...rolls],
    shrunk: unknown[] = [];

  ruleRegistry.register(
    new Removed(
      new Effect((tile: Tile, improvement: TileImprovement): void => {
        onTiles.set(
          tile,
          (onTiles.get(tile) ?? []).filter((other) => other !== improvement)
        );
      })
    ),
    new Built(
      new Effect((tile: Tile, improvement: TileImprovement): void => {
        onTiles.set(tile, [...(onTiles.get(tile) ?? []), improvement]);
      })
    )
  );

  const place = (tile: Tile, ...Types: (typeof TileImprovement)[]) =>
      onTiles.set(
        tile,
        Types.map((Type) => Object.create(Type.prototype))
      ),
    has = (tile: Tile, Type: typeof TileImprovement): boolean =>
      (onTiles.get(tile) ?? []).some(
        (improvement) => improvement.constructor === Type
      ),
    cityAt = (tile: Tile, size: number): City => {
      const city = cityOf('p', { tile: () => tile });

      cities.set(tile, city);
      sizes.set(city, size);

      return city;
    },
    dependencies = {
      ruleRegistry,
      cityRegistry: {
        getByTile: (tile: Tile) => cities.get(tile) ?? null,
      } as any,
      cityGrowthRegistry: {
        getByCity: (city: City) => ({
          size: () => sizes.get(city),
          shrink: (cause: unknown) => {
            shrunk.push(cause);
            sizes.set(city, sizes.get(city)! - 1);
          },
        }),
      } as any,
      tileImprovementRegistry: {
        getByTile: (tile: Tile) => onTiles.get(tile) ?? [],
      } as any,
      // Each roll in turn, then "no" (0.99) for the rest.
      randomNumberGenerator: () => queue.shift() ?? 0.99,
    };

  return {
    centre,
    cityAt,
    dependencies,
    has,
    neighbours,
    place,
    sea,
    shrunk,
    sizes,
  };
};

describe('nuclearBlast (nuclear_blast)', (): void => {
  it('halves each city in the 9 squares, rounded down, and touches nothing else there', (): void => {
    const { centre, cityAt, dependencies, neighbours, sizes } = setUp(),
      city = cityAt(centre, 9),
      neighbour = cityAt(neighbours[0], 1);

    nuclearBlast(centre, 'plant', dependencies);

    expect(sizes.get(city)).equal(5);
    expect(sizes.get(neighbour)).equal(1);
  });

  it('takes a Fortress (not an Airbase), and on a roll of 1 in 2 each the railroad, the mine and the irrigation, then falls out 2 times in 3', (): void => {
    const { dependencies, has, neighbours, place } = setUp([
        // The first square: railroad, mine, irrigation, fallout.
        0.4, 0.4, 0.4, 0.6,
        // The second: railroad kept, mine kept, irrigation kept, no fallout.
        0.6, 0.6, 0.6, 0.7,
      ]),
      [first, second, third] = neighbours,
      // An ocean square rolls nothing.
      centre = {
        isLand: () => false,
        getNeighbours: () => [first, second, third],
      } as unknown as Tile;

    place(first, Fortress, Railroad, Mine, Irrigation);
    place(second, Fortress, Railroad, Mine, Irrigation);
    place(third, Airbase);

    nuclearBlast(centre, 'plant', dependencies);

    [Fortress, Railroad, Mine, Irrigation].forEach(
      (Type) => expect(has(first, Type), Type.name).false
    );
    expect(has(first, Pollution)).true;
    expect(has(second, Fortress)).false;
    [Railroad, Mine, Irrigation].forEach(
      (Type) => expect(has(second, Type), Type.name).true
    );
    expect(has(second, Pollution)).false;
    expect(has(third, Airbase)).true;
  });

  it('on farmland takes the farmland (leaving the irrigation) on a roll of 1 in 2, and leaves the ocean alone', (): void => {
    // Railroad kept, farmland taken, no fallout.
    const { dependencies, has, place } = setUp([0.6, 0.4, 0.99]),
      farm = { isLand: () => true } as unknown as Tile,
      // An ocean square rolls nothing.
      centre = {
        isLand: () => false,
        getNeighbours: () => [farm],
      } as unknown as Tile;

    place(farm, Irrigation, Mine, Farmland);

    nuclearBlast(centre, 'plant', dependencies);

    expect(has(farm, Farmland)).false;
    expect(has(farm, Irrigation)).true;
    expect(has(farm, Mine)).true;
  });
});

describe('city:process-yield, the Nuclear Plant meltdown (city_process_pollution)', (): void => {
  const run = ({
    human = true,
    disorder = true,
    fusion = false,
    level = 3,
    roll = 0,
  } = {}): string[] => {
    const ruleRegistry = new RuleRegistry(),
      cityImprovementRegistry = new CityImprovementRegistry(),
      events: string[] = [],
      tile = {
        isLand: () => true,
        getNeighbours: (): Tile[] => [],
      } as unknown as Tile,
      city = cityOf('p', { tile: () => tile });

    cityImprovementRegistry.register(built(NuclearPlant, city));
    ruleRegistry.register(
      new CivilDisorder(new Effect(() => disorder)),
      ...meltdownRules({
        cityImprovementRegistry,
        cityRegistry: { getByTile: () => null } as any,
        clientRegistry: human ? playedBy('p') : playedBy(),
        engine: { emit: (event: string) => events.push(event) } as any,
        gameDifficultyRegistry: atLevel(level),
        playerResearchRegistry: {
          getByPlayer: () => ({
            completed: (Type: unknown) => fusion && Type === FusionPower,
          }),
        } as any,
        randomNumberGenerator: () => roll,
        ruleRegistry,
        tileImprovementRegistry: { getByTile: () => [] } as any,
      })
    );

    ruleRegistry.process(ProcessYield, new Production(1), city, []);

    return events;
  };

  it("melts down a person's city in disorder with a Nuclear Plant, without Fusion Power, telling the client", (): void => {
    expect(run()).eql(['city:nuclear-meltdown']);
  });

  it("never in order, with Fusion Power, or in a computer player's city", (): void => {
    expect(run({ disorder: false })).eql([]);
    expect(run({ fusion: true })).eql([]);
    expect(run({ human: false })).eql([]);
  });

  it('1 time in (6 − level): 1 in 6 on Chieftain, 1 in 2 on Emperor, always on Deity (the survey has none from Emperor up: the code wins)', (): void => {
    expect([0, 1, 2, 3, 4, 5].map(meltdownOdds)).eql([
      1 / 6,
      1 / 5,
      1 / 4,
      1 / 3,
      1 / 2,
      1,
    ]);
    expect(run({ level: 0, roll: 0.17 })).eql([]);
    expect(run({ level: 0, roll: 0.16 })).eql(['city:nuclear-meltdown']);
    expect(run({ level: 5, roll: 0.99 })).eql(['city:nuclear-meltdown']);
  });
});

describe("the meltdown with civ2-city-happiness's own disorder rule", (): void => {
  it("reads the turn's raw yields, as processCityYields hands them on", (): void => {
    const run = (yields: Yield[]): string[] => {
      const ruleRegistry = new RuleRegistry(),
        cityImprovementRegistry = new CityImprovementRegistry(),
        events: string[] = [],
        tile = {
          isLand: () => true,
          getNeighbours: (): Tile[] => [],
        } as unknown as Tile,
        city = cityOf('p', { tile: () => tile }),
        governments = governedBy(Monarchy);

      cityImprovementRegistry.register(built(NuclearPlant, city));
      ruleRegistry.register(
        ...happinessDisorder(
          { getByCity: () => ({ size: () => 4 }) } as any,
          { getByCity: () => [] } as any,
          governments
        ),
        ...meltdownRules({
          cityImprovementRegistry,
          cityRegistry: { getByTile: () => null } as any,
          clientRegistry: playedBy('p'),
          engine: { emit: (event: string) => events.push(event) } as any,
          gameDifficultyRegistry: atLevel(5),
          playerResearchRegistry: {
            getByPlayer: () => ({ completed: () => false }),
          } as any,
          randomNumberGenerator: () => 0,
          ruleRegistry,
          tileImprovementRegistry: { getByTile: () => [] } as any,
        })
      );

      ruleRegistry.process(ProcessYield, new Production(1), city, yields);

      return events;
    };

    // 3 unhappy, 2 happy in a city of 4: disorder. 2 and 2: order.
    expect(run([new PopulationUnhappiness(3), new LuxuryHappiness(2)])).eql([
      'city:nuclear-meltdown',
    ]);
    expect(run([new PopulationUnhappiness(2), new LuxuryHappiness(2)])).eql([]);
  });
});
