/** A city of a person's may pollute a square around it each turn, as Civ2: no computer player's does. */
export declare const POLLUTION_RULE =
  'civ2-city-improvement:city/process-yield/pollution';
/** The Courthouse halves the corruption civ2-city's rule works out, before the trade is split. */
export declare const COURTHOUSE_RULE =
  'civ2-city-improvement:city/yield/courthouse';
/** A person's city in disorder with a Nuclear Plant may melt down, after its pollution roll. */
export declare const MELTDOWN_RULE =
  'civ2-city-improvement:city/process-yield/nuclear-meltdown';
/** Each turn after the first, global warming moves (`base-global-warming`'s `updateGlobalWarming`), after the barbarians. */
export declare const GLOBAL_WARMING_RULE =
  'civ2-city-improvement:turn/start/global-warming';
/** Polluted squares count toward warming, those in a computer player's city radius at half. */
export declare const WARMING_POLLUTION_RULE =
  'civ2-city-improvement:global-warming/pollution';
/** The level warming moves toward: 2 × the pollution − 4 for each warming − 1 for each city with a Solar Plant. */
export declare const WARMING_TARGET_RULE =
  'civ2-city-improvement:global-warming/target';
/** The level moves 1 a turn toward the target, within 0 to 99. */
export declare const WARMING_LEVEL_RULE =
  'civ2-city-improvement:global-warming/level';
/** A warning at level 12 while the pollution is above 6. */
export declare const WARMING_WARNING_RULE =
  'civ2-city-improvement:global-warming/warning';
/** The world warms above level 16. */
export declare const WARMING_STRIKE_RULE =
  'civ2-city-improvement:global-warming/strike';
/** What a warming makes of a square: inland squares dry on a pattern, coastal ones turn to Swamp or Jungle. */
export declare const WARMED_TERRAIN_RULE =
  'civ2-city-improvement:global-warming/terrain';
