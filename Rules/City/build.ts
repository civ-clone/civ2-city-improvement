import {
  Cathedral,
  CoastalFortress,
  Granary,
  Harbour,
  HydroPlant,
  NuclearPlant,
  OffshorePlatform,
  PoliceStation,
  PortFacility,
  PowerPlant,
  ResearchLab,
} from '../../CityImprovements';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  HooverDam,
  MichelangelosChapel,
  Pyramids,
  SetiProgram,
  WomensSuffrage,
} from '../../Wonders';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import { Registries, owns } from '../../lib/source';
import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import {
  buildRulesFor,
  notBuiltRule,
  siteRule,
} from '@civ-clone/base-city-improvement-rules/lib/build';
import { hasOceanAccess, isCoastal, isHydroSite } from '../../lib/site';
import { Build } from '@civ-clone/core-city-build/Rules/Build';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import Wonder from '@civ-clone/core-wonder/Wonder';
import buildRequirements from '../../Requirements';

const prefix = 'civ2-city-improvement:city/build';

/** An improvement is built once in each city. */
export const notBuilt = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Build => notBuiltRule(`${prefix}/not-built`, cityImprovementRegistry);

/**
 * The improvements only built where the map allows (OpenCiv2 `city_can_build_improvement`): a Harbour and an Offshore
 *  Platform on the coast, a Port Facility and a Coastal Fortress with access to the ocean, and a Hydro Plant by a river
 *  or mountains (`lib/site`).
 */
export const siteRules = (
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance
): Build[] => [
  ...([Harbour, OffshorePlatform] as (typeof CityImprovement)[]).map(
    (Improvement) =>
      siteRule(`${prefix}/coastal/${Improvement.name}`, Improvement, isCoastal)
  ),
  ...([PortFacility, CoastalFortress] as (typeof CityImprovement)[]).map(
    (Improvement) =>
      siteRule(
        `${prefix}/ocean-access/${Improvement.name}`,
        Improvement,
        (city: City): boolean => isCoastal(city) && hasOceanAccess(city)
      )
  ),
  siteRule(
    `${prefix}/hydro-site/${HydroPlant.name}`,
    HydroPlant,
    (city: City): boolean => isHydroSite(city, terrainFeatureRegistry)
  ),
];

/**
 * The improvements a Wonder its player owns already stands in for (OpenCiv2 `city_can_build_improvement`): no Granary
 *  with the Pyramids, Cathedral with Michelangelo's, Police Station with Women's Suffrage, Research Lab with SETI, or
 *  Power, Hydro or Nuclear Plant with the Hoover Dam.
 */
export const wonderExclusions: [typeof CityImprovement, typeof Wonder][] = [
  [Granary, Pyramids],
  [Cathedral, MichelangelosChapel],
  [PoliceStation, WomensSuffrage],
  [ResearchLab, SetiProgram],
  [PowerPlant, HooverDam],
  [HydroPlant, HooverDam],
  [NuclearPlant, HooverDam],
];

export const wonderExclusionRules = (registries: Registries = {}): Build[] =>
  wonderExclusions.map(([Improvement, WonderType]) =>
    siteRule(
      `${prefix}/excluded-by-wonder/${Improvement.name}`,
      Improvement,
      (city: City): boolean => !owns(city.player(), WonderType, registries)
    )
  );

/**
 * Every rule about which improvements a city may build, for a rule registry without a game's `requirements` (tests):
 *  a game's are registered through `game.requirements` (`registerRules`).
 */
export const getRules = (
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance,
  registries: Registries = {}
): Build[] => [
  notBuilt(cityImprovementRegistry),
  ...buildRequirements.flatMap((entry: Requirement): Build[] =>
    buildRulesFor(entry, cityImprovementRegistry, playerResearchRegistry)
  ),
  ...siteRules(terrainFeatureRegistry),
  ...wonderExclusionRules(registries),
];

export default getRules;
