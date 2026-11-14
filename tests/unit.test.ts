import {
  Airport,
  Barracks,
  CoastalFortress,
  PortFacility,
  SamMissileBattery,
  SdiDefence,
} from '../CityImprovements';
import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import { Lighthouse, SunTzusWarAcademy } from '../Wonders';
import { built, cityOf, instanceOf, registries } from './lib/stubs';
import Air from '@civ-clone/base-unit-type-air/Air';
import Created from '@civ-clone/core-unit/Rules/Created';
import { DiplomacyRole } from '@civ-clone/base-unit-role/Roles';
import Interceptor from '@civ-clone/base-unit-trait-interceptor/Interceptor';
import Land from '@civ-clone/base-unit-type-land/Land';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SingleUse from '@civ-clone/base-unit-trait-single-use/SingleUse';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import { expect } from 'chai';
import strength from '../Rules/Unit/strength';
import unitCreated from '../Rules/Unit/created';
import { unitRole } from '@civ-clone/base-unit-role/Rules/UnitRoles';

class Soldier extends Land {}
class Spy extends Land {}
class Ship extends Naval {}
class Plane extends Air {}

const unit = (Type: any, extra: object = {}, traits: Function[] = []) =>
  instanceOf(Type, {
    hasTrait: (Trait: Function) => traits.includes(Trait),
    id: () => 'u',
    ...extra,
  });

describe('unit:created, veterans', (): void => {
  const setUp = () => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      unitImprovementRegistry = new UnitImprovementRegistry(),
      city = cityOf();

    ruleRegistry.register(
      unitRole('test', Spy, DiplomacyRole),
      ...unitCreated(unitImprovementRegistry, ruleRegistry, r)
    );

    const veteran = (u: any): boolean => {
      ruleRegistry.process(Created, u);

      return unitImprovementRegistry
        .getByUnit(u)
        .some((improvement) => improvement instanceof Veteran);
    };

    return { city, r, veteran };
  };

  it("a land unit with Barracks (or Sun Tzu's), but not a diplomat", (): void => {
    const { city, r, veteran } = setUp();

    expect(veteran(unit(Soldier, { city: () => city }))).false;
    r.cityImprovementRegistry.register(built(Barracks, city));
    expect(veteran(unit(Soldier, { city: () => city }))).true;
    expect(veteran(unit(Spy, { city: () => city }))).false;
    expect(veteran(unit(Ship, { city: () => city }))).false;

    const other = setUp();

    other.r.wonders.push(built(SunTzusWarAcademy, cityOf()));
    expect(other.veteran(unit(Soldier, { city: () => other.city }))).true;
  });

  it('a ship with a Port Facility (or the Lighthouse), an aircraft with an Airport, never a missile', (): void => {
    const { city, r, veteran } = setUp();

    r.wonders.push(built(Lighthouse, cityOf()));
    expect(veteran(unit(Ship, { city: () => city }))).true;
    expect(veteran(unit(Plane, { city: () => city }))).false;
    r.cityImprovementRegistry.register(
      built(Airport, city),
      built(PortFacility, city)
    );
    expect(veteran(unit(Plane, { city: () => city }))).true;
    expect(veteran(unit(Plane, { city: () => city }, [SingleUse]))).false;
  });
});

describe('unit:strength, city defences', (): void => {
  const fight = (attacker: any, defender: any, Improvements: any[]) => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      city = cityOf();

    Improvements.forEach((Type) =>
      r.cityImprovementRegistry.register(built(Type, city))
    );
    ruleRegistry.register(
      ...strength({ getByTile: () => city } as any, r.cityImprovementRegistry)
    );

    const defence = new Defence(2);

    ruleRegistry.process(Strength, attacker, defender, new Attack(1), defence);

    return defence.value();
  };

  const at = { tile: () => ({}) },
    missile = unit(Plane, { attack: () => new Attack(18) }, [SingleUse]),
    nuke = unit(Plane, { attack: () => new Attack(99) }, [SingleUse]),
    bomber = unit(Plane, { attack: () => new Attack(12) });

  it("a Coastal Fortress doubles a defence against a ship, but not a ship's", (): void => {
    expect(fight(unit(Ship), unit(Soldier, at), [CoastalFortress])).equal(4);
    expect(fight(unit(Ship), unit(Ship, at), [CoastalFortress])).equal(2);
    expect(fight(unit(Soldier), unit(Soldier, at), [CoastalFortress])).equal(2);
  });

  it('a SAM doubles against an aircraft, an SDI against a missile but not a nuclear one', (): void => {
    expect(fight(bomber, unit(Soldier, at), [SamMissileBattery])).equal(4);
    expect(fight(bomber, unit(Soldier, at), [SdiDefence])).equal(2);
    expect(
      fight(missile, unit(Soldier, at), [SdiDefence, SamMissileBattery])
    ).equal(8);
    expect(fight(nuke, unit(Soldier, at), [SdiDefence])).equal(2);
  });

  it("does nothing for an interceptor, which scrambles, unless it's a missile", (): void => {
    const fighter = unit(Plane, at, [Interceptor]);

    expect(fight(bomber, fighter, [SamMissileBattery])).equal(2);
    expect(fight(missile, fighter, [SamMissileBattery])).equal(4);
  });
});
