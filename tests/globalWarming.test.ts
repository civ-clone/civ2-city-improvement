import {
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Ocean,
  Plains,
  Swamp,
} from '@civ-clone/civ2-world/Terrains';
import {
  GLOBAL_WARMING,
  GLOBAL_WARMING_WARNING,
} from '@civ-clone/base-global-warming/lib/globalWarming';
import {
  Irrigation,
  Mine,
  Pollution,
  Road,
} from '@civ-clone/civ2-world/TileImprovements';
import { built, cityOf, playedBy } from './lib/stubs';
import {
  civ2X,
  isInland,
  oceansAround,
  onPattern,
  warmedTerrain,
} from '../lib/globalWarming';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Engine from '@civ-clone/core-engine/Engine';
import Generator from '@civ-clone/core-world-generator/Generator';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { SolarPlant } from '../CityImprovements';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Tileset from '@civ-clone/core-world/Tileset';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { globalWarmingState } from '@civ-clone/base-global-warming/lib/state';
import globalWarmingRules from '../Rules/Turn/global-warming';
import terrainChangedImprovements from '@civ-clone/civ2-world/Rules/Tile/terrain-changed-improvements';
import tileImprovementBuilt from '@civ-clone/civ2-world/Rules/TileImprovement/built';
import tileImprovementRemoved from '@civ-clone/civ2-world/Rules/TileImprovement/removed';

const letters: { [letter: string]: typeof Terrain } = {
  '~': Ocean,
  d: Desert,
  f: Forest,
  g: Grassland,
  h: Hills,
  j: Jungle,
  p: Plains,
  s: Swamp,
};

class DrawnGenerator extends Generator {
  #rows: string[];
  #ruleRegistry: RuleRegistry;

  constructor(rows: string[], ruleRegistry: RuleRegistry, topologyId: string) {
    super(rows.length, rows[0].length, { topologyId });

    this.#rows = rows;
    this.#ruleRegistry = ruleRegistry;
  }

  async generate(): Promise<Terrain[]> {
    return this.#rows
      .join('')
      .split('')
      .map(
        (letter: string): Terrain => new letters[letter](this.#ruleRegistry)
      );
  }
}

/** A world drawn row by row, one letter a square (`letters`), on a staggered isometric grid unless told otherwise. */
const drawWorld = (
  rows: string[],
  ruleRegistry: RuleRegistry = new RuleRegistry(),
  topologyId: string = 'staggered-iso'
): Promise<World> =>
  new World(
    new DrawnGenerator(rows, ruleRegistry, topologyId),
    ruleRegistry,
    new LandMassRegistry()
  ).build();

const drawn = (world: World): string[] => {
  const letterOf = new Map<Function, string>(
      Object.entries(letters).map(([letter, Type]) => [Type, letter])
    ),
    rows: string[] = [];

  for (let y = 0; y < world.height(); y++) {
    let row = '';

    for (let x = 0; x < world.width(); x++) {
      row += letterOf.get(world.get(x, y).terrain().constructor);
    }

    rows.push(row);
  }

  return rows;
};

// A land square at (2, 4) of a 6 × 10 staggered isometric world (even row: its north-east neighbour is (2, 3), its east
//  one (3, 4), its south one (2, 6)).
const landAt = (oceanAt: [number, number][] = []): string[] => {
  const rows = Array.from({ length: 10 }, () => 'gggggg'.split(''));

  oceanAt.forEach(([x, y]) => (rows[y][x] = '~'));

  return rows.map((row) => row.join(''));
};

describe('global warming: the squares (map_apply_global_warming)', (): void => {
  it("numbers x in half squares on the isometric grid, as the original's pattern reads it", async (): Promise<void> => {
    const world = await drawWorld(landAt());

    expect(civ2X(world.get(2, 4))).to.equal(4);
    expect(civ2X(world.get(2, 5))).to.equal(5);

    const square = await drawWorld(['ggg', 'ggg'], undefined, 'square');

    expect(civ2X(square.get(2, 1))).to.equal(2);
  });

  it('counts the ocean in the 8 directions, and again to the south-west, south, south-east and east (the overread)', async (): Promise<void> => {
    const count = async (oceanAt: [number, number][]): Promise<number> =>
      oceansAround((await drawWorld(landAt(oceanAt))).get(2, 4));

    expect(await count([])).to.equal(0);
    // North (2, 2), north-east (2, 3), west (1, 4): once each.
    expect(await count([[2, 2]])).to.equal(1);
    expect(await count([[2, 3]])).to.equal(1);
    expect(await count([[1, 4]])).to.equal(1);
    // East (3, 4), south (2, 6), south-east (2, 5), south-west (1, 5): twice each.
    expect(await count([[3, 4]])).to.equal(2);
    expect(await count([[2, 6]])).to.equal(2);
    expect(await count([[2, 5]])).to.equal(2);
    expect(await count([[1, 5]])).to.equal(2);
    // All 8 around: 12. Anything further off doesn't count.
    expect(
      await count([
        [2, 2],
        [2, 3],
        [3, 4],
        [2, 5],
        [2, 6],
        [1, 5],
        [1, 4],
        [1, 3],
        [0, 4],
        [4, 4],
        [2, 0],
        [2, 8],
      ])
    ).to.equal(12);
  });

  it("doesn't count off the map's top or bottom as ocean", async (): Promise<void> => {
    const world = await drawWorld(['~~~~', 'gggg', 'gggg', 'gggg']);

    // (1, 0)'s north, north-east and north-west are off the map; its east and west are ocean.
    expect(oceansAround(world.get(1, 0))).to.equal(3);
    // (1, 1) (odd row): north-east (2, 0) and north-west (1, 0) are ocean, its north (1, -1) is off the map.
    expect(oceansAround(world.get(1, 1))).to.equal(2);
  });

  it('is inland below 7 oceans less the warmings so far, and never from the seventh warming on', async (): Promise<void> => {
    // South-west, south, south-east (twice each) and north: 7 oceans.
    const seven = (
        await drawWorld(
          landAt([
            [1, 5],
            [2, 6],
            [2, 5],
            [2, 2],
          ])
        )
      ).get(2, 4),
      // Without the north: 6.
      six = (
        await drawWorld(
          landAt([
            [1, 5],
            [2, 6],
            [2, 5],
          ])
        )
      ).get(2, 4),
      none = (await drawWorld(landAt())).get(2, 4);

    expect(oceansAround(seven)).to.equal(7);
    expect(oceansAround(six)).to.equal(6);
    expect(isInland(seven, 0)).to.equal(false);
    expect(isInland(six, 0)).to.equal(true);
    expect(isInland(six, 1)).to.equal(false);
    expect(isInland(none, 6)).to.equal(true);
    expect(isInland(none, 7)).to.equal(false);
    expect(isInland(none, 8)).to.equal(false);
  });

  it('takes the inland pattern where (3x − 3y) & 7 is the warmings so far, x in half squares', async (): Promise<void> => {
    const world = await drawWorld(landAt());

    // (2, 4): x 4, y 4: 0.
    expect(onPattern(world.get(2, 4), 0)).to.equal(true);
    expect(onPattern(world.get(2, 4), 1)).to.equal(false);
    // (2, 5): x 5, y 5: 0. (3, 4): x 6, y 4: 6. (0, 1): x 1, y 1: 0; (1, 0): x 2, y 0: 6; (0, 3): x 1, y 3: −6 & 7 = 2.
    expect(onPattern(world.get(2, 5), 0)).to.equal(true);
    expect(onPattern(world.get(3, 4), 6)).to.equal(true);
    expect(onPattern(world.get(1, 0), 6)).to.equal(true);
    expect(onPattern(world.get(0, 3), 2)).to.equal(true);
    // The eighth warming on: never (& 7 is below 8).
    expect(onPattern(world.get(2, 4), 8)).to.equal(false);
  });

  it('dries inland squares on the pattern: Desert and Plains to Desert, Grassland and Forest to Plains', async (): Promise<void> => {
    const at = async (letter: string, x: number, y: number) => {
      const rows = landAt().map((row) => row.split(''));

      rows[y][x] = letter;

      return (await drawWorld(rows.map((row) => row.join('')))).get(x, y);
    };

    expect(warmedTerrain(await at('d', 2, 4), 0)).to.equal(Desert);
    expect(warmedTerrain(await at('p', 2, 4), 0)).to.equal(Desert);
    expect(warmedTerrain(await at('g', 2, 4), 0)).to.equal(Plains);
    expect(warmedTerrain(await at('f', 2, 4), 0)).to.equal(Plains);
    // Off the pattern, nothing.
    expect(warmedTerrain(await at('g', 2, 4), 1)).to.equal(null);
    expect(warmedTerrain(await at('g', 2, 3), 0)).to.equal(null);
    // Other land never changes.
    expect(warmedTerrain(await at('h', 2, 4), 0)).to.equal(null);
    expect(warmedTerrain(await at('s', 2, 4), 7)).to.equal(null);
    expect(warmedTerrain(await at('j', 2, 4), 7)).to.equal(null);
  });

  it('turns every coastal square, off the pattern too, Forest to Jungle and the rest to Swamp', async (): Promise<void> => {
    // From the seventh warming on, every one of the four is "coastal", with no ocean in sight.
    for (const [letter, Expected] of [
      ['d', Swamp],
      ['p', Swamp],
      ['g', Swamp],
      ['f', Jungle],
    ] as [string, typeof Terrain][]) {
      const inland = (
          await drawWorld(
            landAt().map((row, y) => (y === 4 ? `gg${letter}ggg` : row))
          )
        ).get(2, 4),
        // Seven oceans (south-west, south and south-east twice, and north): coastal at warming 0, off the pattern too.
        coast = (
          await drawWorld(
            landAt([
              [1, 5],
              [2, 6],
              [2, 5],
              [2, 2],
            ]).map((row, y) => (y === 4 ? `gg${letter}ggg` : row))
          )
        ).get(2, 4);

      expect(oceansAround(inland)).to.equal(0);
      expect(warmedTerrain(inland, 7)).to.equal(Expected);
      expect(warmedTerrain(inland, 12)).to.equal(Expected);
      expect(oceansAround(coast)).to.equal(7);
      expect(onPattern(coast, 0)).to.equal(true);
      expect(onPattern(coast, 1)).to.equal(false);
      expect(warmedTerrain(coast, 0)).to.equal(Expected);
      expect(warmedTerrain(coast, 1)).to.equal(Expected);
    }
  });
});

describe('global warming: the counter (game_update_global_warming)', (): void => {
  const setUp = async ({
    computerCities = (world: World): Tile[][] => [],
    personCities = (world: World): Tile[][] => [],
    solarPlants = 0,
    rows = landAt(),
  } = {}) => {
    const ruleRegistry = new RuleRegistry(),
      world = await drawWorld(rows, ruleRegistry),
      tileImprovementRegistry = new TileImprovementRegistry(),
      pendingEffectRegistry = new PendingEffectRegistry(),
      cityImprovementRegistry = new CityImprovementRegistry(),
      engine = new Engine(),
      turn = new Turn(),
      events: [string, ...unknown[]][] = [],
      cities = [
        ...computerCities(world).map((tiles) =>
          cityOf('computer', { tiles: () => new Tileset(...tiles) })
        ),
        ...personCities(world).map((tiles) =>
          cityOf('person', { tiles: () => new Tileset(...tiles) })
        ),
      ];

    cities.slice(0, solarPlants).forEach((city) => {
      cityImprovementRegistry.register(built(SolarPlant, city));
    });

    engine.on(GLOBAL_WARMING, (...args: unknown[]) =>
      events.push([GLOBAL_WARMING, ...args])
    );
    engine.on(GLOBAL_WARMING_WARNING, (...args: unknown[]) =>
      events.push([GLOBAL_WARMING_WARNING, ...args])
    );

    ruleRegistry.register(
      ...tileImprovementBuilt(tileImprovementRegistry),
      ...tileImprovementRemoved(tileImprovementRegistry, engine),
      ...terrainChangedImprovements(tileImprovementRegistry, ruleRegistry),
      ...globalWarmingRules({
        cityImprovementRegistry,
        cityRegistry: { entries: () => cities } as any,
        clientRegistry: playedBy('person'),
        engine,
        pendingEffectRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        turn,
      })
    );

    const pollute = (...tiles: Tile[]) =>
        tiles.forEach((tile) => new Pollution(tile, ruleRegistry)),
      nextTurn = (): void => {
        turn.increment();
        ruleRegistry.process(Start, turn);
      },
      state = () => globalWarmingState(pendingEffectRegistry);

    return {
      events,
      nextTurn,
      pollute,
      ruleRegistry,
      state,
      tileImprovementRegistry,
      turn,
      world,
    };
  };

  it("doesn't move on the first turn, and moves 1 a turn after it", async (): Promise<void> => {
    const { nextTurn, pollute, state, world } = await setUp();

    pollute(world.get(0, 0));

    nextTurn();
    expect(state().level).to.equal(0);

    nextTurn();
    expect(state().level).to.equal(1);

    // Target 2: it stops there.
    nextTurn();
    nextTurn();
    expect(state().level).to.equal(2);
  });

  it("counts pollution in a computer player's city radius at half, once for each such city, rounded down once", async (): Promise<void> => {
    const settled = async (
      cities: Parameters<typeof setUp>[0],
      squares: [number, number][]
    ): Promise<number> => {
      const { nextTurn, pollute, state, world } = await setUp(cities);

      pollute(...squares.map(([x, y]) => world.get(x, y)));

      for (let i = 0; i < 30; i++) {
        nextTurn();
      }

      // The level settles at the target, 2 × the pollution.
      return state().level / 2;
    };

    const three: [number, number][] = [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      overTwo = (world: World): Tile[][] => [
        [world.get(0, 0), world.get(1, 0)],
      ];

    // None near a computer player's city: 3.
    expect(await settled({}, three)).to.equal(3);
    // A computer player's city over two of them: 1 + 2 − 2 + 2 / 2 = 2.
    expect(await settled({ computerCities: overTwo }, three)).to.equal(2);
    // A person's city over them doesn't count.
    expect(await settled({ personCities: overTwo }, three)).to.equal(3);
    // Over one only: 3 − 1 + 0 (1 / 2 rounded down) = 2.
    expect(
      await settled({ computerCities: (world) => [[world.get(0, 0)]] }, three)
    ).to.equal(2);
    // Two computer cities over the same two: counted for each (w = 4): 3 − 4 + 2 = 1.
    expect(
      await settled(
        { computerCities: (world) => [...overTwo(world), ...overTwo(world)] },
        three
      )
    ).to.equal(1);
  });

  it('takes 4 off the target for each warming and 1 for each city with a Solar Plant', async (): Promise<void> => {
    const { nextTurn, pollute, state, world } = await setUp({
      personCities: () => [[], []],
      solarPlants: 2,
    });

    // 3 polluted: target 6 − 2 = 4.
    pollute(world.get(0, 0), world.get(1, 0), world.get(2, 0));

    for (let i = 0; i < 20; i++) {
      nextTurn();
    }

    expect(state().level).to.equal(4);
  });

  it('warns at level 12 with the pollution above 6, and warms above 16, from level 0 again', async (): Promise<void> => {
    const { events, nextTurn, pollute, state, world } = await setUp({
      rows: ['~~~~~~', ...landAt().slice(1)],
    });

    // 9 polluted squares: target 18, so the level climbs 1 a turn from turn 2.
    pollute(...world.entries().slice(6, 15));

    for (let turn = 1; turn <= 12; turn++) {
      nextTurn();
    }

    // Turn 12: level 11.
    expect(state().level).to.equal(11);
    expect(events).to.deep.equal([]);

    nextTurn();
    expect(state().level).to.equal(12);
    expect(events.map(([name]) => name)).to.deep.equal([
      GLOBAL_WARMING_WARNING,
    ]);
    expect(events[0].slice(1)).to.deep.equal([12, 9]);

    // 13 to 16: nothing; 17: it warms.
    for (let i = 0; i < 4; i++) {
      nextTurn();
    }

    expect(state()).to.deep.include({ level: 16, warmings: 0 });
    expect(events).to.have.length(1);

    nextTurn();
    expect(state()).to.deep.include({ level: 0, warmings: 1 });
    expect(events.map(([name]) => name)).to.deep.equal([
      GLOBAL_WARMING_WARNING,
      GLOBAL_WARMING,
    ]);
    expect(events[1][1]).to.equal(1);

    // Now 4 less: the target is 18 − 4, and it climbs from 0 to 14 and stays.
    for (let i = 0; i < 20; i++) {
      nextTurn();
    }

    expect(state()).to.deep.include({ level: 14, warmings: 1 });
  });

  it("doesn't warn at 12 with the pollution at 6", async (): Promise<void> => {
    const { events, nextTurn, pollute, state, world } = await setUp();

    // 6 squares: target 12.
    pollute(...world.entries().slice(0, 6));

    for (let turn = 1; turn <= 20; turn++) {
      nextTurn();
    }

    expect(state().level).to.equal(12);
    expect(events).to.deep.equal([]);
  });

  it('changes the coast to Swamp and Jungle, taking irrigation and a mine with it, and dries the inland pattern', async (): Promise<void> => {
    // (2, 4) has 8 oceans around it (east, south, south-east, south-west, each twice): coastal. (2, 3) is Forest with 4.
    const rows = landAt([
        [3, 4],
        [2, 6],
        [2, 5],
        [1, 5],
      ]).map((row, y) => (y === 3 ? 'ggfggg' : row)),
      {
        events,
        nextTurn,
        pollute,
        ruleRegistry,
        state,
        tileImprovementRegistry,
        world,
      } = await setUp({ rows }),
      coast = world.get(2, 4),
      has = (tile: Tile, Type: Function): boolean =>
        tileImprovementRegistry
          .getByTile(tile)
          .some((improvement) => improvement instanceof Type);

    new Irrigation(coast, ruleRegistry);
    new Mine(coast, ruleRegistry);
    new Road(coast, ruleRegistry);

    // What each square should become, decided on the map as it is: the warming decides every square before it changes any.
    const expected = world.entries().map((tile: Tile): string => {
      const Warmed = warmedTerrain(tile, 0);

      return Warmed === null
        ? rows[tile.y()][tile.x()]
        : Object.entries(letters).find(([, Type]) => Type === Warmed)![0];
    });

    // 9 polluted squares on rows 7 to 9: target 18, so it warms on turn 18.
    pollute(
      ...world
        .entries()
        .filter((tile) => tile.y() >= 7)
        .slice(0, 9)
    );

    for (let turn = 1; turn <= 17; turn++) {
      nextTurn();
    }

    expect(state().warmings).to.equal(0);

    nextTurn();
    expect(state().warmings).to.equal(1);
    expect(events.map(([name]) => name)).to.deep.equal([
      GLOBAL_WARMING_WARNING,
      GLOBAL_WARMING,
    ]);

    expect(drawn(world).join('')).to.equal(expected.join(''));
    // The coast is Swamp, without its irrigation or mine; its road stays.
    expect(coast.terrain()).to.be.instanceOf(Swamp);
    expect(has(coast, Irrigation)).to.equal(false);
    expect(has(coast, Mine)).to.equal(false);
    expect(has(coast, Road)).to.equal(true);
    // The Forest at (2, 3) is inland and off the pattern ((3 × 5 − 9) & 7 = 6): it stays.
    expect(world.get(2, 3).terrain()).to.be.instanceOf(Forest);
    // (0, 0) is inland and on it: Grassland becomes Plains. (4, 0) too ((24 − 0) & 7 = 0).
    expect(world.get(0, 0).terrain()).to.be.instanceOf(Plains);
    expect(world.get(4, 0).terrain()).to.be.instanceOf(Plains);
    // The changed squares are reported with the warming.
    expect((events[1][2] as Tile[]).includes(coast)).to.equal(true);
  });
});
