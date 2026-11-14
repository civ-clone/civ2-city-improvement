import {
  Aqueduct,
  Bank,
  Barracks,
  Cathedral,
  CityWalls,
  Colosseum,
  Courthouse,
  Factory,
  Granary,
  HydroPlant,
  Library,
  ManufacturingPlant,
  Marketplace,
  NuclearPlant,
  Palace,
  PowerPlant,
  SewerSystem,
  Temple,
  University,
} from '../../CityImprovements';
import {
  BuildPriorityDependencies,
  CityNeeds,
  buildPriorityRules,
} from '@civ-clone/base-city-improvement-rules/lib/buildPriority';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  Corruption,
  Food,
  Gold,
  Luxuries,
  Production,
  Research,
  Unhappiness,
} from '../../Yields';
import { UpkeepDependencies, upkeep } from '../../lib/upkeep';
import { aqueductSize, sewerSize } from '../../data/rules';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Player from '@civ-clone/core-player/Player';
import { capitalOf } from '../../lib/capital';

/** How much a city with no capital in its player's empire wants the Palace back: above any other need but war. */
export const palacePriority = 20;

// A city near a size cap wants the improvement that lifts it (sooner with food to spare).
const nearCap =
  (size: number) =>
  ({ food, size: citySize }: CityNeeds): number =>
    citySize >= size - 2
      ? (citySize - (size - 3)) * 2 + (food >= 4 ? 2 : 0)
      : food >= 4 && citySize >= size - 4
      ? 2
      : 0;

/**
 * A computer player's rules of thumb for which improvement a city builds, as civ1-city-improvement's (they follow the
 *  feel of the game, not its code) with Civilization II's size caps, and the Palace: a player that has lost its capital
 *  rebuilds it in its largest city, or corruption takes almost all of its trade (civ2-city).
 */
export const getRules = (
  dependencies: BuildPriorityDependencies &
    UpkeepDependencies & {
      cityGrowthRegistry?: CityGrowthRegistry;
      cityRegistry?: CityRegistry;
    } = {}
): BuildPriority[] => {
  const {
      cityGrowthRegistry = cityGrowthRegistryInstance,
      cityRegistry = cityRegistryInstance,
    } = dependencies,
    isLargest = (city: City): boolean => {
      const size = (other: City) => cityGrowthRegistry.getByCity(other).size(),
        [largest] = cityRegistry
          .getByPlayer(city.player())
          .slice()
          .sort((a: City, b: City): number => size(b) - size(a));

      return largest === city;
    };

  return buildPriorityRules(
    'civ2-city-improvement',
    {
      needs: [
        [
          Palace,
          ({ city }): number =>
            capitalOf(city.player(), dependencies) === null && isLargest(city)
              ? palacePriority
              : 0,
        ],
        [
          Granary,
          ({ food, size }): number =>
            food < 0 ? 3 : food <= 1 && size >= 3 ? 1 : 0,
        ],
        [Aqueduct, nearCap(aqueductSize)],
        [SewerSystem, nearCap(sewerSize)],
        [
          Temple,
          ({ size, unhappy }): number =>
            unhappy > 0 ? 2 + unhappy * 2 : size >= 5 ? 1 : 0,
        ],
        [Colosseum, ({ unhappy }): number => Math.max(0, unhappy - 2) * 2],
        [Cathedral, ({ unhappy }): number => Math.max(0, unhappy - 3) * 2],
        [Marketplace, ({ gold, luxuries }): number => (gold + luxuries) * 0.5],
        [Library, ({ research }): number => research * 0.5],
        [Bank, ({ gold, luxuries }): number => (gold + luxuries) * 0.3],
        [University, ({ research }): number => research * 0.3],
        [
          Courthouse,
          ({ corruption }): number => (corruption >= 2 ? corruption * 0.5 : 0),
        ],
        [
          Factory,
          ({ production }): number => (production >= 8 ? production * 0.25 : 0),
        ],
      ],
      everydayImprovements: [
        Bank,
        Courthouse,
        Granary,
        Library,
        Marketplace,
        Temple,
        University,
      ],
      everyday: 0.1,
      withFactory: [
        [ManufacturingPlant, 0.2],
        [HydroPlant, 0.15],
        [NuclearPlant, 0.15],
        [PowerPlant, 0.15],
      ],
      factories: [Factory, ManufacturingPlant],
      forWar: [Barracks, CityWalls],
      warPriority: 100,
    },
    { Corruption, Food, Gold, Luxuries, Production, Research, Unhappiness },
    (Improvement: typeof CityImprovement, player: Player): number =>
      upkeep(Improvement, player, dependencies),
    dependencies
  );
};

export default getRules;
