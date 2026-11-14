import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  CoastalFortress,
  SamMissileBattery,
  SdiDefence,
} from '../../CityImprovements';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import { cityDefenceMultiplier, sdiMissileAttackBelow } from '../../data/rules';
import Air from '@civ-clone/base-unit-type-air/Air';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Interceptor from '@civ-clone/base-unit-trait-interceptor/Interceptor';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import SingleUse from '@civ-clone/base-unit-trait-single-use/SingleUse';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Unit from '@civ-clone/core-unit/Unit';
import { improvementOf } from '@civ-clone/base-city-improvement-rules/lib/has';

// A defending city's Coastal Fortress, SAM Missile Battery and SDI Defense (OpenCiv2 `src/auto/unit_combat.cpp`
//  `unit_resolve_attack_city_defenses`, richardpenman/civ2@49f26ec), each doubling the defence, after civ2-unit's own
//  bonuses (each multiplies what's there, so the order doesn't change the outcome):
//  - a Coastal Fortress, against a ship attacking anything but a ship;
//  - against an aircraft, unless the defender is an interceptor and the attacker not a missile: an SDI Defense against
//    a missile with an attack below 99 (not a nuclear one), and a SAM Missile Battery against any.
export const getRules = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Strength[] => {
  const inCityWith = (unit: Unit, Improvement: typeof CityImprovement) => {
      const city = cityRegistry.getByTile(unit.tile());

      return (
        city !== null &&
        improvementOf(city, Improvement, cityImprovementRegistry) !== null
      );
    },
    airDefence = (attacker: Unit, defender: Unit): boolean =>
      attacker instanceof Air &&
      (!defender.hasTrait(Interceptor) || attacker.hasTrait(SingleUse)),
    doubled = (Improvement: typeof CityImprovement) =>
      new Effect(
        (attacker: Unit, defender: Unit, attack: Attack, defence: Defence) =>
          defence.add(
            defence.value() * (cityDefenceMultiplier - 1),
            Improvement.name
          )
      );

  return [
    new Strength(
      `civ2-city-improvement:unit/strength/${CoastalFortress.name}`,
      new Criterion(
        (attacker: Unit, defender: Unit): boolean =>
          attacker instanceof Naval && !(defender instanceof Naval)
      ),
      new Criterion((attacker: Unit, defender: Unit): boolean =>
        inCityWith(defender, CoastalFortress)
      ),
      doubled(CoastalFortress)
    ),
    new Strength(
      `civ2-city-improvement:unit/strength/${SdiDefence.name}`,
      new Criterion(airDefence),
      new Criterion(
        (attacker: Unit): boolean =>
          attacker.hasTrait(SingleUse) &&
          attacker.attack().value() < sdiMissileAttackBelow
      ),
      new Criterion((attacker: Unit, defender: Unit): boolean =>
        inCityWith(defender, SdiDefence)
      ),
      doubled(SdiDefence)
    ),
    new Strength(
      `civ2-city-improvement:unit/strength/${SamMissileBattery.name}`,
      new Criterion(airDefence),
      new Criterion((attacker: Unit, defender: Unit): boolean =>
        inCityWith(defender, SamMissileBattery)
      ),
      doubled(SamMissileBattery)
    ),
  ];
};

export default getRules;
