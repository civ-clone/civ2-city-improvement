import {
  Airport,
  Aqueduct,
  Bank,
  Barracks,
  Cathedral,
  CityWalls,
  CoastalFortress,
  Colosseum,
  Courthouse,
  Factory,
  Granary,
  Harbour,
  HydroPlant,
  Library,
  ManufacturingPlant,
  Marketplace,
  MassTransit,
  NuclearPlant,
  OffshorePlatform,
  Palace,
  PoliceStation,
  PortFacility,
  PowerPlant,
  RecyclingCenter,
  ResearchLab,
  SamMissileBattery,
  SdiDefence,
  SewerSystem,
  SolarPlant,
  StockExchange,
  Superhighways,
  Supermarket,
  Temple,
  University,
} from '../CityImprovements';
import {
  AmphibiousWarfare,
  Automobile,
  Banking,
  CeremonialBurial,
  CodeOfLaws,
  Communism,
  Computers,
  Construction,
  Currency,
  Economics,
  Electronics,
  Environmentalism,
  Industrialization,
  Laser,
  Masonry,
  MassProduction,
  Metallurgy,
  Miniaturization,
  Monotheism,
  NuclearPower,
  Pottery,
  Radio,
  Recycling,
  Refining,
  Refrigeration,
  Robotics,
  Rocketry,
  Sanitation,
  Seafaring,
  University as UniversityAdvance,
  Writing,
} from '@civ-clone/civ2-science/Advances';
import Advance from '@civ-clone/core-science/Advance';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';

/** An improvement's @IMPROVE row: its class, its cost in rows of shields, its upkeep in gold, and its advance. */
export type ImprovementRow = [
  Improvement: typeof CityImprovement,
  cost: number,
  upkeep: number,
  prerequisite: typeof Advance | null
];

// RULES.TXT @IMPROVE rows 1 to 34, read by OpenCiv2 `src/auto/civ.cpp` `rules_load_improvements`
//  (richardpenman/civ2@49f26ec; its baked copy is `src/game/rules.cpp` `rules_improvements`). Numbers only: cost in rows
//  of shields (× @COSMIC's shield box rows), upkeep in gold a turn, and the advance needed (`null`: none).
export const improvements: ImprovementRow[] = [
  // @IMPROVE row 1.
  [Palace, 10, 0, Masonry],
  // @IMPROVE row 2.
  [Barracks, 4, 1, null],
  // @IMPROVE row 3.
  [Granary, 6, 1, Pottery],
  // @IMPROVE row 4.
  [Temple, 4, 1, CeremonialBurial],
  // @IMPROVE row 5.
  [Marketplace, 8, 1, Currency],
  // @IMPROVE row 6.
  [Library, 8, 1, Writing],
  // @IMPROVE row 7.
  [Courthouse, 8, 1, CodeOfLaws],
  // @IMPROVE row 8.
  [CityWalls, 8, 0, Masonry],
  // @IMPROVE row 9.
  [Aqueduct, 8, 2, Construction],
  // @IMPROVE row 10.
  [Bank, 12, 3, Banking],
  // @IMPROVE row 11.
  [Cathedral, 12, 3, Monotheism],
  // @IMPROVE row 12.
  [University, 16, 3, UniversityAdvance],
  // @IMPROVE row 13.
  [MassTransit, 16, 4, MassProduction],
  // @IMPROVE row 14.
  [Colosseum, 10, 4, Construction],
  // @IMPROVE row 15.
  [Factory, 20, 4, Industrialization],
  // @IMPROVE row 16.
  [ManufacturingPlant, 32, 6, Robotics],
  // @IMPROVE row 17.
  [SdiDefence, 20, 4, Laser],
  // @IMPROVE row 18.
  [RecyclingCenter, 20, 2, Recycling],
  // @IMPROVE row 19.
  [PowerPlant, 16, 4, Refining],
  // @IMPROVE row 20.
  [HydroPlant, 24, 4, Electronics],
  // @IMPROVE row 21.
  [NuclearPlant, 16, 2, NuclearPower],
  // @IMPROVE row 22.
  [StockExchange, 16, 4, Economics],
  // @IMPROVE row 23.
  [SewerSystem, 12, 2, Sanitation],
  // @IMPROVE row 24.
  [Supermarket, 8, 3, Refrigeration],
  // @IMPROVE row 25.
  [Superhighways, 20, 5, Automobile],
  // @IMPROVE row 26.
  [ResearchLab, 16, 3, Computers],
  // @IMPROVE row 27.
  [SamMissileBattery, 10, 2, Rocketry],
  // @IMPROVE row 28.
  [CoastalFortress, 8, 1, Metallurgy],
  // @IMPROVE row 29.
  [SolarPlant, 32, 4, Environmentalism],
  // @IMPROVE row 30.
  [Harbour, 6, 1, Seafaring],
  // @IMPROVE row 31.
  [OffshorePlatform, 16, 3, Miniaturization],
  // @IMPROVE row 32.
  [Airport, 16, 3, Radio],
  // @IMPROVE row 33.
  [PoliceStation, 6, 2, Communism],
  // @IMPROVE row 34.
  [PortFacility, 8, 3, AmphibiousWarfare],
];

export default improvements;
