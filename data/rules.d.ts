/** `city_process_food`: a Granary (or the Pyramids) leaves half a box (@COSMIC's food rows ÷ 2 a citizen) after growth. */
export declare const granaryRowsPerCitizen: number;
/** The share of the food box a Granary (or the Pyramids) keeps on growth. */
export declare const granaryStore: number;
/** `city_needed_size_improvement`: the sizes a city can't grow past without an Aqueduct and a Sewer System. */
export declare const aqueductSize: number;
export declare const sewerSize: number;
/** `city_calc_trade_happiness` stage 2: a Colosseum's content citizens, and one more with Electronics. */
export declare const colosseumContent = 3;
export declare const colosseumElectronicsContent = 1;
/** `city_calc_trade_happiness` stage 2: a Cathedral's (or Michelangelo's) content citizens with Theology, one fewer without. */
export declare const cathedralContent = 3;
/** `city_calc_trade_happiness` stage 2: the Cathedral's one fewer without Theology and one more without Communism. */
export declare const cathedralTheologyContent = 1;
export declare const cathedralCommunismContent = 1;
/** `city_calc_trade_happiness` stage 2: a Temple's content citizen with each of Ceremonial Burial and Mysticism. */
export declare const templeContentPerAdvance = 1;
/** `city_calc_trade_happiness` stage 2: the Oracle multiplies its owner's Temples' content citizens. */
export declare const oracleMultiplier = 2;
/** `city_split_trade`: each Marketplace, Bank and Stock Exchange (and Library, University and Research Lab) adds 1/2. */
export declare const cityBonusShift = 1;
/** `city_calc_corruption`: a Courthouse halves the corruption. */
export declare const courthouseCorruptionDivisor = 2;
/** Under Democracy a Courthouse, or the Palace, makes one content citizen happy. */
export declare const courthouseDemocracyHappy = 1;
/** `civ_improvement_upkeep`: with Adam Smith's, an improvement whose upkeep is this costs nothing. */
export declare const adamSmithUpkeep = 1;
/** `city_tile_yield`: a Harbour's food, and an Offshore Platform's shield, on each ocean square. */
export declare const harbourFood = 1;
export declare const offshorePlatformProduction = 1;
/** `city_tile_yield`: a Supermarket adds food >> 1 on farmland, and Superhighways trade ÷ 2 on a road. */
export declare const supermarketShift = 1;
export declare const superhighwaysDivisor = 2;
/** `city_calc_shields_pollution`: a Factory and a Manufacturing Plant each add 2/4 of the shields; a plant 2/4 more, no more than they do. */
export declare const factoryQuarters = 2;
export declare const manufacturingPlantQuarters = 2;
export declare const plantQuarters = 2;
/** `city_calc_shields_pollution`: pollution is shields ÷ divisor − 20, plus size × factor ÷ 4. */
export declare const pollutionTolerance = 20;
export declare const populationPollutionDivisor = 4;
/** `city_process_pollution`: the roll is out of 256 less half the advances known × the level. */
export declare const pollutionRollCeiling = 256;
/** `civ_improvement_upkeep`: Barracks cost 1 less below Prince, 1 more with Gunpowder and 1 more with Mobile Warfare. */
export declare const barracksPrinceLevel = 2;
/** `city_capture_aftermath_palace_escape`: what it costs to save the Palace, and who may. */
export declare const palaceEscapeCost = 1000;
export declare const palaceEscapeMinimumSize = 8;
export declare const palaceEscapeAboveLevel = 2;
export declare const palaceEscapeCities = 11;
export declare const palaceEscapeGold = 1999;
/** `unit_resolve_attack_city_defenses`: Coastal Fortress, SAM Missile Battery and SDI Defense each double the defence. */
export declare const cityDefenceMultiplier = 2;
/** `unit_resolve_attack_city_defenses`: the SDI Defense doubles against a missile with an attack below 99 (not a nuke). */
export declare const sdiMissileAttackBelow = 99;
/** `city_split_trade`: J. S. Bach's Cathedral's content citizens, counted in Fundamentalism's tithes. */
export declare const bachContent = 2;
/**
 * `game_update_global_warming` (game.cpp 00486c2e): the level moves 1 a turn toward 2 × the pollution − 4 for each
 *  warming so far − 1 for each city with a Solar Plant, and stays within 0 to 99. Pollution in a computer player's city
 *  radius counts half (`polluted − w + w / 2`).
 */
export declare const warmingStep = 1;
export declare const warmingMinimum = 0;
export declare const warmingMaximum = 99;
export declare const warmingPollutionFactor = 2;
export declare const warmingPerWarming = 4;
export declare const warmingComputerDivisor = 2;
/** `game_update_global_warming`: a warning when the level is 12 and the pollution is above 6; a warming above 16. */
export declare const warmingWarningLevel = 12;
export declare const warmingWarningPollutionAbove = 6;
export declare const warmingStrikeAboveLevel = 16;
/**
 * `map_apply_global_warming` (map.cpp 004868fb): a square with fewer oceans around it than 7 less the warmings so far
 *  is inland, and changes only where `(3x − 3y) & 7` is the warmings so far.
 */
export declare const warmingInlandOceansBelow = 7;
export declare const warmingPatternMask = 7;
