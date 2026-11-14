"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdiMissileAttackBelow = exports.cityDefenceMultiplier = exports.palaceEscapeGold = exports.palaceEscapeCities = exports.palaceEscapeAboveLevel = exports.palaceEscapeMinimumSize = exports.palaceEscapeCost = exports.barracksPrinceLevel = exports.pollutionRollCeiling = exports.populationPollutionDivisor = exports.pollutionTolerance = exports.plantQuarters = exports.manufacturingPlantQuarters = exports.factoryQuarters = exports.bonusHalvesPerLevel = exports.cathedralContent = exports.colosseumContent = exports.sewerSize = exports.aqueductSize = exports.granaryRowsPerCitizen = void 0;
// Civilization II's city improvement numbers besides @IMPROVE's, each with the OpenCiv2 function it comes from
//  (richardpenman/civ2@49f26ec). Numbers only.
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
/** `city_process_food`: a Granary (or the Pyramids) leaves half a box (@COSMIC's food rows ÷ 2 a citizen) after growth. */
exports.granaryRowsPerCitizen = cosmic_1.default.foodBoxRows >> 1;
/** `city_needed_size_improvement`: the sizes a city can't grow past without an Aqueduct and a Sewer System. */
exports.aqueductSize = cosmic_1.default.aqueductSize;
exports.sewerSize = cosmic_1.default.sewerSize;
/** `city_calc_trade_happiness` stage 2: a Colosseum's content citizens, and one more with Electronics. */
exports.colosseumContent = 3;
/** `city_calc_trade_happiness` stage 2: a Cathedral's (or Michelangelo's) content citizens with Theology, one fewer without. */
exports.cathedralContent = 3;
/** `city_split_trade`: each of Marketplace, Bank and Stock Exchange (Library, University, Research Lab) adds half the base. */
exports.bonusHalvesPerLevel = 1;
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
//# sourceMappingURL=rules.js.map