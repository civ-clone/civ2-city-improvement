import { Airport, Barracks, PortFacility } from '../../CityImprovements';
import { Lighthouse, SunTzusWarAcademy } from '../../Wonders';
import { Registries, hasEither } from '../../lib/source';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  UnitImprovementRegistry,
  instance as unitImprovementRegistryInstance,
} from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import { DiplomacyRole, TradeRole } from '@civ-clone/base-unit-role/Roles';
import Air from '@civ-clone/base-unit-type-air/Air';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Created from '@civ-clone/core-unit/Rules/Created';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import Land from '@civ-clone/base-unit-type-land/Land';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import SingleUse from '@civ-clone/base-unit-trait-single-use/SingleUse';
import Unit from '@civ-clone/core-unit/Unit';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { hasRole } from '@civ-clone/base-unit-role/roleOf';

// A unit built in a city is a veteran (OpenCiv2 `src/auto/city_production.cpp` `city_process_production_unit`,
//  richardpenman/civ2@49f26ec): a land unit with Barracks (or Sun Tzu's), unless its role is diplomacy or trade; a ship
//  with a Port Facility (or the Lighthouse); an aircraft with an Airport; never a missile (`SingleUse`).
export const getRules = (
  unitImprovementRegistry: UnitImprovementRegistry = unitImprovementRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  registries: Registries = {}
): Created[] =>
  (
    [
      [Land, Barracks, SunTzusWarAcademy],
      [Naval, PortFacility, Lighthouse],
      [Air, Airport, null],
    ] as [typeof Unit, typeof CityImprovement, typeof Wonder | null][]
  ).map(
    ([Domain, Improvement, WonderType]) =>
      new Created(
        `civ2-city-improvement:unit/created/veteran/${Improvement.name}`,
        new Criterion(
          (unit: Unit): boolean =>
            unit instanceof Domain && unit.city() !== null
        ),
        new Criterion((unit: Unit): boolean => !unit.hasTrait(SingleUse)),
        new Criterion(
          (unit: Unit): boolean =>
            Domain !== Land ||
            !(
              hasRole(unit, DiplomacyRole, ruleRegistry) ||
              hasRole(unit, TradeRole, ruleRegistry)
            )
        ),
        new Criterion((unit: Unit): boolean =>
          hasEither(unit.city() as City, Improvement, WonderType, registries)
        ),
        new Effect((unit: Unit): void =>
          unitImprovementRegistry.register(new Veteran(unit))
        ),
        new Description(
          { type: 'veteran_units', subject: Improvement, unit: Domain },
          ...(WonderType === null
            ? []
            : [
                {
                  type: 'veteran_units',
                  subject: WonderType,
                  unit: Domain,
                  scope: 'player',
                },
              ])
        )
      )
  );

export default getRules;
