"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovements_1 = require("../../CityImprovements");
const Wonders_1 = require("../../Wonders");
const source_1 = require("../../lib/source");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const UnitImprovementRegistry_1 = require("@civ-clone/core-unit-improvement/UnitImprovementRegistry");
const Roles_1 = require("@civ-clone/base-unit-role/Roles");
const Air_1 = require("@civ-clone/base-unit-type-air/Air");
const Created_1 = require("@civ-clone/core-unit/Rules/Created");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Land_1 = require("@civ-clone/base-unit-type-land/Land");
const Naval_1 = require("@civ-clone/base-unit-type-naval/Naval");
const SingleUse_1 = require("@civ-clone/base-unit-trait-single-use/SingleUse");
const Veteran_1 = require("@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran");
const roleOf_1 = require("@civ-clone/base-unit-role/roleOf");
// A unit built in a city is a veteran (OpenCiv2 `src/auto/city_production.cpp` `city_process_production_unit`,
//  richardpenman/civ2@49f26ec): a land unit with Barracks (or Sun Tzu's), unless its role is diplomacy or trade; a ship
//  with a Port Facility (or the Lighthouse); an aircraft with an Airport; never a missile (`SingleUse`).
const getRules = (unitImprovementRegistry = UnitImprovementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, registries = {}) => [
    [Land_1.default, CityImprovements_1.Barracks, Wonders_1.SunTzusWarAcademy],
    [Naval_1.default, CityImprovements_1.PortFacility, Wonders_1.Lighthouse],
    [Air_1.default, CityImprovements_1.Airport, null],
].map(([Domain, Improvement, WonderType]) => new Created_1.default(`civ2-city-improvement:unit/created/veteran/${Improvement.name}`, new Criterion_1.default((unit) => unit instanceof Domain && unit.city() !== null), new Criterion_1.default((unit) => !unit.hasTrait(SingleUse_1.default)), new Criterion_1.default((unit) => Domain !== Land_1.default ||
    !((0, roleOf_1.hasRole)(unit, Roles_1.DiplomacyRole, ruleRegistry) ||
        (0, roleOf_1.hasRole)(unit, Roles_1.TradeRole, ruleRegistry))), new Criterion_1.default((unit) => (0, source_1.hasEither)(unit.city(), Improvement, WonderType, registries)), new Effect_1.default((unit) => unitImprovementRegistry.register(new Veteran_1.default(unit))), new Description_1.default({ type: 'veteran_units', subject: Improvement, unit: Domain }, ...(WonderType === null
    ? []
    : [
        {
            type: 'veteran_units',
            subject: WonderType,
            unit: Domain,
            scope: 'player',
        },
    ]))));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=created.js.map