"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const rules_1 = require("../../data/rules");
const Air_1 = require("@civ-clone/base-unit-type-air/Air");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Interceptor_1 = require("@civ-clone/base-unit-trait-interceptor/Interceptor");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const SingleUse_1 = require("@civ-clone/base-unit-trait-single-use/SingleUse");
const Strength_1 = require("@civ-clone/core-unit/Rules/Strength");
const has_1 = require("@civ-clone/base-city-improvement-rules/lib/has");
// A defending city's Coastal Fortress, SAM Missile Battery and SDI Defense (OpenCiv2 `src/auto/unit_combat.cpp`
//  `unit_resolve_attack_city_defenses`, richardpenman/civ2@49f26ec), each doubling the defence, after civ2-unit's own
//  bonuses (each multiplies what's there, so the order doesn't change the outcome):
//  - a Coastal Fortress, against a ship attacking anything but a ship;
//  - against an aircraft, unless the defender is an interceptor and the attacker not a missile: an SDI Defense against
//    a missile with an attack below 99 (not a nuclear one), and a SAM Missile Battery against any.
const getRules = (cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    const inCityWith = (unit, Improvement) => {
        const city = cityRegistry.getByTile(unit.tile());
        return (city !== null &&
            (0, has_1.improvementOf)(city, Improvement, cityImprovementRegistry) !== null);
    }, airDefence = (attacker, defender) => attacker instanceof Air_1.default &&
        (!defender.hasTrait(Interceptor_1.default) || attacker.hasTrait(SingleUse_1.default)), doubled = (Improvement) => new Effect_1.default((attacker, defender, attack, defence) => defence.add(defence.value() * (rules_1.cityDefenceMultiplier - 1), Improvement.name));
    return [
        new Strength_1.default(`civ2-city-improvement:unit/strength/${CityImprovements_1.CoastalFortress.name}`, new Criterion_1.default((attacker, defender) => attacker instanceof Naval_1.default && !(defender instanceof Naval_1.default)), new Criterion_1.default((attacker, defender) => inCityWith(defender, CityImprovements_1.CoastalFortress)), doubled(CityImprovements_1.CoastalFortress), new Description_1.default({
            type: 'defence_multiplier',
            subject: CityImprovements_1.CoastalFortress,
            value: rules_1.cityDefenceMultiplier,
            against: [Naval_1.default],
            notFor: [Naval_1.default],
        })),
        new Strength_1.default(`civ2-city-improvement:unit/strength/${CityImprovements_1.SdiDefence.name}`, new Criterion_1.default(airDefence), new Criterion_1.default((attacker) => attacker.hasTrait(SingleUse_1.default) &&
            attacker.attack().value() < rules_1.sdiMissileAttackBelow), new Criterion_1.default((attacker, defender) => inCityWith(defender, CityImprovements_1.SdiDefence)), doubled(CityImprovements_1.SdiDefence), new Description_1.default({
            type: 'defence_multiplier',
            subject: CityImprovements_1.SdiDefence,
            value: rules_1.cityDefenceMultiplier,
            against: [SingleUse_1.default],
        })),
        new Strength_1.default(`civ2-city-improvement:unit/strength/${CityImprovements_1.SamMissileBattery.name}`, new Criterion_1.default(airDefence), new Criterion_1.default((attacker, defender) => inCityWith(defender, CityImprovements_1.SamMissileBattery)), doubled(CityImprovements_1.SamMissileBattery), new Description_1.default({
            type: 'defence_multiplier',
            subject: CityImprovements_1.SamMissileBattery,
            value: rules_1.cityDefenceMultiplier,
            against: [Air_1.default],
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=strength.js.map