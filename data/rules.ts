// Civilization II's city improvement numbers besides @IMPROVE's, each with the OpenCiv2 function it comes from
//  (richardpenman/civ2@49f26ec). Numbers only.
import cosmic from '@civ-clone/civ2-rules/data/cosmic';

/** `city_process_food`: a Granary (or the Pyramids) leaves half a box (@COSMIC's food rows ÷ 2 a citizen) after growth. */
export const granaryRowsPerCitizen = cosmic.foodBoxRows >> 1;

/** `city_needed_size_improvement`: the sizes a city can't grow past without an Aqueduct and a Sewer System. */
export const aqueductSize = cosmic.aqueductSize;
export const sewerSize = cosmic.sewerSize;

/** `city_calc_trade_happiness` stage 2: a Colosseum's content citizens, and one more with Electronics. */
export const colosseumContent = 3;

/** `city_calc_trade_happiness` stage 2: a Cathedral's (or Michelangelo's) content citizens with Theology, one fewer without. */
export const cathedralContent = 3;

/** `city_calc_shields_pollution`: a Factory and a Manufacturing Plant each add 2/4 of the shields; a plant 2/4 more, no more than they do. */
export const factoryQuarters = 2;
export const manufacturingPlantQuarters = 2;
export const plantQuarters = 2;

/** `city_calc_shields_pollution`: pollution is shields ÷ divisor − 20, plus size × factor ÷ 4. */
export const pollutionTolerance = 20;
export const populationPollutionDivisor = 4;

/** `city_process_pollution`: the roll is out of 256 less half the advances known × the level. */
export const pollutionRollCeiling = 256;

/** `civ_improvement_upkeep`: Barracks cost 1 less below Prince, 1 more with Gunpowder and 1 more with Mobile Warfare. */
export const barracksPrinceLevel = 2;

/** `city_capture_aftermath_palace_escape`: what it costs to save the Palace, and who may. */
export const palaceEscapeCost = 1000;
export const palaceEscapeMinimumSize = 8;
export const palaceEscapeAboveLevel = 2;
export const palaceEscapeCities = 11;
export const palaceEscapeGold = 1999;

/** `unit_resolve_attack_city_defenses`: Coastal Fortress, SAM Missile Battery and SDI Defense each double the defence. */
export const cityDefenceMultiplier = 2;

/** `unit_resolve_attack_city_defenses`: the SDI Defense doubles against a missile with an attack below 99 (not a nuke). */
export const sdiMissileAttackBelow = 99;

/** `city_split_trade`: J. S. Bach's Cathedral's content citizens, counted in Fundamentalism's tithes. */
export const bachContent = 2;

/**
 * `game_update_global_warming` (game.cpp 00486c2e): the level moves 1 a turn toward 2 × the pollution − 4 for each
 *  warming so far − 1 for each city with a Solar Plant, and stays within 0 to 99. Pollution in a computer player's city
 *  radius counts half (`polluted − w + w / 2`).
 */
export const warmingStep = 1;
export const warmingMinimum = 0;
export const warmingMaximum = 99;
export const warmingPollutionFactor = 2;
export const warmingPerWarming = 4;
export const warmingComputerDivisor = 2;

/** `game_update_global_warming`: a warning when the level is 12 and the pollution is above 6; a warming above 16. */
export const warmingWarningLevel = 12;
export const warmingWarningPollutionAbove = 6;
export const warmingStrikeAboveLevel = 16;

/**
 * `map_apply_global_warming` (map.cpp 004868fb): a square with fewer oceans around it than 7 less the warmings so far
 *  is inland, and changes only where `(3x − 3y) & 7` is the warmings so far.
 */
export const warmingInlandOceansBelow = 7;
export const warmingPatternMask = 7;
