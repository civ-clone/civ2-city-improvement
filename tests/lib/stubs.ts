import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityImprovementRegistry from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import Government from '@civ-clone/core-government/Government';
import { Registries } from '../../lib/source';
import RequirementRegistry from '@civ-clone/core-requirement/RequirementRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';

/** An instance of `Type` without running its constructor, with `extra` laid over it. */
export const instanceOf = <T>(
  Type: abstract new (...args: any[]) => T,
  extra: object = {}
): T => Object.assign(Object.create(Type.prototype), extra);

let ids = 0;

/** A city of `player`'s, standing, on `tile`. */
export const cityOf = (player: unknown = 'p', extra: object = {}): City =>
  instanceOf(City, {
    player: () => player,
    originalPlayer: () => player,
    destroyed: () => false,
    tile: () => null,
    ...extra,
  });

/** A standing improvement (or Wonder) of `Type` in `city`. */
export const built = <T extends CityImprovement>(
  Type: abstract new (...args: any[]) => T,
  city: City
): T =>
  instanceOf(Type, {
    city: () => city,
    _destroyed: false,
    id: (
      (id) => () =>
        `i${id}`
    )(++ids),
  });

/** Registries in which each player knows `known` and owns `wonders`. */
export const registries = (
  known: Function[] = [],
  wonders: Wonder[] = []
): Required<Registries> & { known: Function[]; wonders: Wonder[] } => {
  const state = { known, wonders };

  return {
    ...state,
    cityImprovementRegistry: new CityImprovementRegistry(),
    wonderRegistry: {
      getByPlayer: (player: unknown) =>
        state.wonders.filter((wonder) => wonder.city().player() === player),
      getByCity: (city: unknown) =>
        state.wonders.filter((wonder) => wonder.city() === city),
    } as any,
    playerResearchRegistry: {
      getByPlayer: () => ({
        completed: (Type: Function) => state.known.includes(Type),
        complete: () => state.known,
      }),
      some: () => false,
    } as any,
    requirementRegistry: new RequirementRegistry(),
  };
};

/** A player government registry whose players all have `Current`. */
export const governedBy = (Current: typeof Government) =>
  ({
    getByPlayer: () => ({
      is: (...governments: (typeof Government)[]) =>
        governments.some((Type) => Current === Type),
    }),
  } as any);

/** A difficulty registry at `level` (0 Chieftain to 5 Deity). */
export const atLevel = (level: number) =>
  ({ get: () => ({ level: () => level }) } as any);

/** A client registry in which `humans` are a person's players. */
export const playedBy = (...humans: unknown[]) =>
  ({
    getBy: (key: string, player: unknown) =>
      humans.includes(player) ? [{}] : [],
  } as any);
