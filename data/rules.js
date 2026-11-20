"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warmingPatternMask = exports.warmingInlandOceansBelow = exports.warmingStrikeAboveLevel = exports.warmingWarningPollutionAbove = exports.warmingWarningLevel = exports.warmingComputerDivisor = exports.warmingPerWarming = exports.warmingPollutionFactor = exports.warmingMaximum = exports.warmingMinimum = exports.warmingStep = exports.bachContent = exports.sdiMissileAttackBelow = exports.cityDefenceMultiplier = exports.palaceEscapeGold = exports.palaceEscapeCities = exports.palaceEscapeAboveLevel = exports.palaceEscapeMinimumSize = exports.palaceEscapeCost = exports.barracksPrinceLevel = exports.pollutionRollCeiling = exports.populationPollutionDivisor = exports.pollutionTolerance = exports.plantQuarters = exports.manufacturingPlantQuarters = exports.factoryQuarters = exports.superhighwaysDivisor = exports.supermarketShift = exports.offshorePlatformProduction = exports.harbourFood = exports.adamSmithUpkeep = exports.courthouseDemocracyHappy = exports.courthouseCorruptionDivisor = exports.cityBonusShift = exports.oracleMultiplier = exports.templeContentPerAdvance = exports.cathedralCommunismContent = exports.cathedralTheologyContent = exports.cathedralContent = exports.colosseumElectronicsContent = exports.colosseumContent = exports.sewerSize = exports.aqueductSize = exports.granaryStore = exports.granaryRowsPerCitizen = void 0;
// Civilization II's city improvement numbers besides @IMPROVE's, each with the OpenCiv2 function it comes from
//  (richardpenman/civ2@49f26ec). Numbers only.
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
/** `city_process_food`: a Granary (or the Pyramids) leaves half a box (@COSMIC's food rows ÷ 2 a citizen) after growth. */
exports.granaryRowsPerCitizen = cosmic_1.default.foodBoxRows >> 1;
/** The share of the food box a Granary (or the Pyramids) keeps on growth. */
exports.granaryStore = exports.granaryRowsPerCitizen / cosmic_1.default.foodBoxRows;
/** `city_needed_size_improvement`: the sizes a city can't grow past without an Aqueduct and a Sewer System. */
exports.aqueductSize = cosmic_1.default.aqueductSize;
exports.sewerSize = cosmic_1.default.sewerSize;
/** `city_calc_trade_happiness` stage 2: a Colosseum's content citizens, and one more with Electronics. */
exports.colosseumContent = 3;
exports.colosseumElectronicsContent = 1;
/** `city_calc_trade_happiness` stage 2: a Cathedral's (or Michelangelo's) content citizens with Theology, one fewer without. */
exports.cathedralContent = 3;
/** `city_calc_trade_happiness` stage 2: the Cathedral's one fewer without Theology and one more without Communism. */
exports.cathedralTheologyContent = 1;
exports.cathedralCommunismContent = 1;
/** `city_calc_trade_happiness` stage 2: a Temple's content citizen with each of Ceremonial Burial and Mysticism. */
exports.templeContentPerAdvance = 1;
/** `city_calc_trade_happiness` stage 2: the Oracle multiplies its owner's Temples' content citizens. */
exports.oracleMultiplier = 2;
/** `city_split_trade`: each Marketplace, Bank and Stock Exchange (and Library, University and Research Lab) adds 1/2. */
exports.cityBonusShift = 1;
/** `city_calc_corruption`: a Courthouse halves the corruption. */
exports.courthouseCorruptionDivisor = 2;
/** Under Democracy a Courthouse, or the Palace, makes one content citizen happy. */
exports.courthouseDemocracyHappy = 1;
/** `civ_improvement_upkeep`: with Adam Smith's, an improvement whose upkeep is this costs nothing. */
exports.adamSmithUpkeep = 1;
/** `city_tile_yield`: a Harbour's food, and an Offshore Platform's shield, on each ocean square. */
exports.harbourFood = 1;
exports.offshorePlatformProduction = 1;
/** `city_tile_yield`: a Supermarket adds food >> 1 on farmland, and Superhighways trade ÷ 2 on a road. */
exports.supermarketShift = 1;
exports.superhighwaysDivisor = 2;
/** `city_calc_shields_pollution`: a Factory and a Manufacturing Plant each add 2/4 of the shields; a plant 2/4 more, no more than they do. */
exports.factoryQuarters = 2;
exports.manufacturingPlantQuarters = 2;
exports.plantQuarters = 2;
/** `city_calc_shields_pollution`: pollution is shields ÷ divisor − 20, plus size × factor ÷ 4. */
exports.pollutionTolerance = 20;
exports.populationPollutionDivisor = 4;
/** `city_process_pollution`: the roll is out of 256 less half the advances known × the level. */
exports.pollutionRollCeiling = 256;
/** `civ_improvement_upkeep`: Barracks cost 1 less below Prince, 1 more with Gunpowder and 1 more with Mobile Warfare. */
exports.barracksPrinceLevel = 2;
/** `city_capture_aftermath_palace_escape`: what it costs to save the Palace, and who may. */
exports.palaceEscapeCost = 1000;
exports.palaceEscapeMinimumSize = 8;
exports.palaceEscapeAboveLevel = 2;
exports.palaceEscapeCities = 11;
exports.palaceEscapeGold = 1999;
/** `unit_resolve_attack_city_defenses`: Coastal Fortress, SAM Missile Battery and SDI Defense each double the defence. */
exports.cityDefenceMultiplier = 2;
/** `unit_resolve_attack_city_defenses`: the SDI Defense doubles against a missile with an attack below 99 (not a nuke). */
exports.sdiMissileAttackBelow = 99;
/** `city_split_trade`: J. S. Bach's Cathedral's content citizens, counted in Fundamentalism's tithes. */
exports.bachContent = 2;
/**
 * `game_update_global_warming` (game.cpp 00486c2e): the level moves 1 a turn toward 2 × the pollution − 4 for each
 *  warming so far − 1 for each city with a Solar Plant, and stays within 0 to 99. Pollution in a computer player's city
 *  radius counts half (`polluted − w + w / 2`).
 */
exports.warmingStep = 1;
exports.warmingMinimum = 0;
exports.warmingMaximum = 99;
exports.warmingPollutionFactor = 2;
exports.warmingPerWarming = 4;
exports.warmingComputerDivisor = 2;
/** `game_update_global_warming`: a warning when the level is 12 and the pollution is above 6; a warming above 16. */
exports.warmingWarningLevel = 12;
exports.warmingWarningPollutionAbove = 6;
exports.warmingStrikeAboveLevel = 16;
/**
 * `map_apply_global_warming` (map.cpp 004868fb): a square with fewer oceans around it than 7 less the warmings so far
 *  is inland, and changes only where `(3x − 3y) & 7` is the warmings so far.
 */
exports.warmingInlandOceansBelow = 7;
exports.warmingPatternMask = 7;
//# sourceMappingURL=rules.js.map