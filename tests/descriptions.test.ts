import * as CityImprovements from '../CityImprovements';
import * as Wonders from '../Wonders';
import {
  CeremonialBurial,
  Communism,
  Electronics,
  Monotheism,
  Mysticism,
  Theology,
} from '@civ-clone/civ2-science/Advances';
import {
  CityImprovementMaintenanceGold,
  Corruption,
  Gold,
  Luxuries,
  Production,
  Research,
  Unhappiness,
} from '../Yields';
import {
  atLevel,
  built,
  cityOf,
  governedBy,
  instanceOf,
  playedBy,
  registries,
} from './lib/stubs';
import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  Democracy,
  Fundamentalism,
} from '@civ-clone/civ2-government/Governments';
import { Farmland, Road } from '@civ-clone/civ2-world/TileImprovements';
import Air from '@civ-clone/base-unit-type-air/Air';
import Land from '@civ-clone/base-unit-type-land/Land';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import { Ocean } from '@civ-clone/civ2-world/Terrains';
import SingleUse from '@civ-clone/base-unit-trait-single-use/SingleUse';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import { growthLimits } from '../lib/growthLimit';
import {
  Environmentalism,
  Industrialization,
  Sanitation,
} from '@civ-clone/civ2-science/Advances';
import { barracksAdvances } from '../lib/upkeep';
import {
  barracksPrinceLevel,
  captureKeepOddRowsChance,
  palaceEscapeCost,
} from '../data/rules';
import CityCreated from '@civ-clone/core-city/Rules/Created';
import cityCreated from '../Rules/City/created';
import InciteRevolt from '@civ-clone/base-unit-action-incite-revolt/InciteRevolt';
import { Prince } from '@civ-clone/civ2-difficulty/Difficulties';
import { pollutingAdvances, populationFactor } from '../lib/pollution';
import { Pollution } from '@civ-clone/civ2-world/TileImprovements';
import Captured from '@civ-clone/core-city/Rules/Captured';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import WarmingTarget from '@civ-clone/base-global-warming/Rules/WarmingTarget';
import captured from '../Rules/City/captured';
import globalWarming from '../Rules/Turn/global-warming';
import improvementCreated from '../Rules/CityImprovement/created';
import researchComplete from '../Rules/Player/research-complete';
import { upkeepFor } from '../lib/upkeep';
import improvements from '../data/improvements';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import Rule from '@civ-clone/core-rule/Rule';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import grow from '../Rules/City/grow';
import meltdown from '../Rules/City/meltdown';
import pollution from '../Rules/City/pollution';
import pollutionDivisor from '../Rules/City/pollution-divisor';
import cost from '../Rules/City/cost';
import strength from '../Rules/Unit/strength';
import tileYield from '../Rules/City/tile-yield';
import unitCreated from '../Rules/Unit/created';
import upkeep from '../lib/upkeep';
import yieldModifier from '../Rules/City/yield-modifier';
import yieldRules from '../Rules/City/yield';

// What the rules say they do, for the Civilopedia (civ-clone/web-renderer#1196), checked against what they do.

type Class = Function & { name: string };

const described = (rules: Rule[]): [Rule, EffectDescription][] =>
    rules.flatMap((rule: Rule) =>
      rule
        .descriptions()
        .map((description): [Rule, EffectDescription] => [rule, description])
    ),
  allRules = (): Rule[] => [
    ...cost(),
    ...grow(),
    ...meltdown(),
    ...pollution(),
    ...pollutionDivisor(),
    ...strength(),
    ...tileYield(),
    ...unitCreated(),
    ...yieldModifier(),
    ...yieldRules(),
  ];

class Soldier extends Land {}
class Ship extends Naval {}
class Plane extends Air {}

const unit = (Type: any, extra: object = {}, traits: Function[] = []) =>
    instanceOf(Type, {
      hasTrait: (Trait: Function) => traits.includes(Trait),
      id: () => 'u',
      ...extra,
    }),
  isWonder = (Type: unknown): boolean =>
    (Object.values(Wonders) as unknown[]).includes(Type);

describe('descriptions', (): void => {
  it('says something about every improvement but the City Walls, and each Wonder it acts for', (): void => {
    const subjects = new Set(
      described(allRules()).map(([, description]) => description.subject)
    );

    Object.values(CityImprovements)
      .filter((Improvement) => Improvement !== CityImprovements.CityWalls)
      .forEach((Improvement): void => {
        expect(subjects.has(Improvement), Improvement.name).to.true;
      });

    [
      Wonders.AdamSmithsTradingCompany,
      Wonders.HooverDam,
      Wonders.IsaacNewtonsCollege,
      Wonders.JsBachsCathedral,
      Wonders.Lighthouse,
      Wonders.MichelangelosChapel,
      Wonders.Oracle,
      Wonders.Pyramids,
      Wonders.SetiProgram,
      Wonders.SunTzusWarAcademy,
    ].forEach((WonderType): void => {
      expect(subjects.has(WonderType), WonderType.name).to.true;
    });
  });

  it('a yield modifier adds the share of the base it says it does, and a Wonder acts as its improvement', (): void => {
    const base = 40,
      // What the yield modifiers add to `YieldType` in a city with `Sources`, from a base of 40 of each yield.
      addedBy = (YieldType: typeof Yield, ...Sources: Class[]): number => {
        const r = registries(),
          city = cityOf('p'),
          yields = [Gold, Luxuries, Research, Production].map(
            (Type) => new Type(base)
          );

        Sources.forEach((Source) =>
          (Object.values(Wonders) as Class[]).includes(Source)
            ? r.wonders.push(built(Source as any, city))
            : r.cityImprovementRegistry.register(built(Source as any, city))
        );

        return yieldModifier(r)
          .filter((rule) => rule.validate(city, yields, yields))
          .map((rule) => rule.process(city, yields, yields) as Yield)
          .filter((result) => result instanceof YieldType)
          .reduce((total, result) => total + result.value(), 0);
      },
      cases = described(yieldModifier());

    expect(cases.length).to.be.greaterThan(0);

    cases.forEach(([, description]): void => {
      const Subject = description.subject as Class;

      if (description.type === 'acts_as') {
        expect(description.scope).to.equal('player');

        // With a Factory, so that a plant counts.
        [Gold, Luxuries, Research, Production].forEach((YieldType) =>
          expect(
            addedBy(YieldType, Subject, CityImprovements.Factory),
            Subject.name
          ).to.equal(
            addedBy(
              YieldType,
              description.improvement as Class,
              CityImprovements.Factory
            )
          )
        );

        return;
      }

      expect(description.type).to.equal('yield_percent');
      expect(description.of).to.equal('base');

      const YieldType = description.yield as typeof Yield,
        per = (description.per as Class[] | undefined) ?? [],
        // One of what it needs, and each of what it adds for.
        context = [
          ...((description.needs as Class[] | undefined) ?? []).slice(0, 1),
          ...per,
        ];

      expect(
        (addedBy(YieldType, ...context, Subject) -
          addedBy(YieldType, ...context)) /
          base /
          Math.max(per.length, 1),
        Subject.name
      ).to.equal(description.value);
    });
  });

  it('the Courthouse halves the corruption, as it says', (): void => {
    const r = registries(),
      city = cityOf('p'),
      [rule] = yieldRules(r).filter((rule) =>
        rule
          .descriptions()
          .some(
            (description) => description.subject === CityImprovements.Courthouse
          )
      ),
      [description] = rule.descriptions(),
      yields = [new Corruption(40)];

    r.cityImprovementRegistry.register(
      built(CityImprovements.Courthouse, city)
    );

    expect(rule.validate(city, yields)).to.true;
    // Corruption counts below 0, and what's added gives some back: −50% of it.
    expect(
      reduceYield([rule.process(city, yields) as Yield], Corruption) /
        reduceYield(yields, Corruption)
    ).to.equal(description.value);
  });

  it('the content improvements make the citizens content that they say', (): void => {
    const content = (
      Improvement: Class,
      known: Function[],
      WonderType: Class | null = null
    ): number => {
      const r = registries(known),
        city = cityOf('p');

      if (WonderType !== null) {
        r.wonders.push(built(WonderType as any, city));
      }

      r.cityImprovementRegistry.register(built(Improvement as any, city));

      const yields = [new Unhappiness(10)];

      return cost({
        ...r,
        clientRegistry: playedBy('p'),
        gameDifficultyRegistry: atLevel(5),
        playerGovernmentRegistry: governedBy(Democracy),
      })
        .filter((rule) =>
          rule
            .descriptions()
            .some(
              (description) =>
                description.type === 'content' &&
                description.subject === Improvement
            )
        )
        .reduce(
          (total: number, rule): number =>
            rule.validate(city, yields)
              ? total + Math.abs((rule.process(city, yields) as Yield).value())
              : total,
          0
        );
    };

    const value = (Subject: Class, step?: string, Clause?: Function) =>
      described(cost())
        .map(([, description]) => description)
        .find(
          (description) =>
            description.subject === Subject &&
            description.type === 'content' &&
            description.step === step &&
            (Clause === undefined ||
              (description.with as Function[] | undefined)?.includes(Clause) ||
              description.until === Clause)
        )!.value as number;

    const { Temple, Colosseum, Cathedral } = CityImprovements;

    expect(content(Temple, [CeremonialBurial])).to.equal(value(Temple));
    expect(content(Temple, [CeremonialBurial, Mysticism])).to.equal(
      value(Temple) + value(Temple, 'more', Mysticism)
    );
    expect(
      content(Temple, [CeremonialBurial, Mysticism], Wonders.Oracle)
    ).to.equal(
      (value(Temple) + value(Temple, 'more', Mysticism)) *
        (described(cost()).find(
          ([, description]) => description.type === 'content_multiplier'
        )![1].value as number)
    );
    expect(content(Colosseum, [])).to.equal(value(Colosseum));
    expect(content(Colosseum, [Electronics])).to.equal(
      value(Colosseum) + value(Colosseum, 'more', Electronics)
    );
    expect(content(Cathedral, [])).to.equal(0);
    expect(content(Cathedral, [Monotheism])).to.equal(
      value(Cathedral) -
        value(Cathedral, 'fewer', Theology) +
        value(Cathedral, 'more', Communism)
    );
    expect(content(Cathedral, [Monotheism, Theology, Communism])).to.equal(
      value(Cathedral)
    );
  });

  it('an improvement costs the upkeep it says it does', (): void => {
    const cases = described(cost()).filter(
      ([, description]) =>
        description.type === 'upkeep' &&
        description.with === undefined &&
        description.subject !== CityImprovements.Barracks
    );

    expect(cases.length).to.be.greaterThan(0);

    cases.forEach(([, description]): void => {
      expect(
        upkeep(description.subject as any, 'p' as any, {
          ...registries(),
          gameDifficultyRegistry: atLevel(5),
          playerGovernmentRegistry: governedBy(Democracy),
        }),
        (description.subject as Class).name
      ).to.equal(description.value);
    });
  });

  it('each rule that says something says it of a class, with the type and fields it uses', (): void => {
    described(allRules()).forEach(([, description]): void => {
      expect(description.type).to.be.a('string');
      expect(description.subject).to.be.a('function');
    });
  });

  it('a pollution divisor rule returns the divisor it says', (): void => {
    const r = registries(),
      city = cityOf('p');

    Object.values(CityImprovements).forEach((Improvement) =>
      r.cityImprovementRegistry.register(built(Improvement as any, city))
    );

    described(pollutionDivisor(r))
      .filter(([, description]) => description.type === 'pollution_divisor')
      .forEach(([rule, description]): void => {
        expect(rule.process(city)).to.equal(description.value);
      });
  });

  it('the Granary keeps the share of the box it says', (): void => {
    const r = registries(),
      city = cityOf('p'),
      [rule] = grow(r),
      [description] = rule.descriptions(),
      added: Yield[] = [];

    r.cityImprovementRegistry.register(built(CityImprovements.Granary, city));

    const growth = {
      city: () => city,
      size: () => 3,
      add: (value: Yield) => added.push(value),
    };

    expect(rule.validate(growth)).to.true;
    rule.process(growth);
    // The box at size 4 is (size + 1) × @COSMIC's rows.
    expect(
      added[0].value() /
        (4 * require('@civ-clone/civ2-rules/data/cosmic').default.foodBoxRows)
    ).to.equal(description.value);
  });
  it('a square gets the yield it says', (): void => {
    // Farmland's own line says the Supermarket's again, from Farmland's side (civ-clone/web-renderer#1272).
    const cases = described(tileYield()).filter(
      ([, description]) => description.type !== 'square_yield_percent'
    );

    expect(cases.length).to.equal(4);

    cases.forEach(([, description]): void => {
      const Subject = description.subject as Class,
        YieldType = description.yield as typeof Yield,
        r = registries(),
        city = cityOf('p', { tile: () => null }),
        tile: any = {
          terrain: () => (description.on === 'ocean' ? new Ocean() : {}),
        },
        On = { farmland: Farmland, roads: Road }[description.on as string],
        [rule] = tileYield({
          cityImprovementRegistry: r.cityImprovementRegistry,
          tileImprovementRegistry: {
            getByTile: () => (On ? [Object.create(On.prototype)] : []),
          } as any,
        }).filter((rule) => rule.descriptions()[0].subject === Subject),
        yields: Yield[] = [new YieldType(4)];

      r.cityImprovementRegistry.register(built(Subject as any, city));

      expect(rule.validate(city, tile, yields), Subject.name).to.true;
      rule.process(city, tile, yields);

      const added = yields[1].value();

      expect(
        description.type === 'tile_yield' ? added : added / 4,
        Subject.name
      ).to.equal(description.value);
    });
  });

  it("Farmland says what a Supermarket adds on it, as the Supermarket's own line does", (): void => {
    const [[rule, farmland]] = described(tileYield()).filter(
        ([, description]) => description.type === 'square_yield_percent'
      ),
      [supermarket] = rule.descriptions();

    expect(farmland).to.eql({
      type: 'square_yield_percent',
      subject: Farmland,
      yield: supermarket.yield,
      value: supermarket.value,
      inCitiesWith: CityImprovements.Supermarket,
    });
    expect(supermarket.subject).to.equal(CityImprovements.Supermarket);
    expect(supermarket.value).to.equal(0.5);
  });

  it("Sanitation and Environmentalism each say they take a step off the people's pollution, as populationFactor does", (): void => {
    expect(
      pollution()
        .flatMap((rule) => rule.descriptions())
        .filter(
          ({ type, subject }) =>
            type === 'pollution_step' && subject !== CityImprovements.SolarPlant
        )
    ).to.eql(
      [Sanitation, Environmentalism].map((Advance) => ({
        type: 'pollution_step',
        subject: Advance,
        value: 1,
        source: 'population',
        scope: 'player',
      }))
    );

    // A city of a player who knows Industrialization: 2 steps without Sanitation, 1 with it, 0 with Environmentalism too.
    const knowing = (...known: Function[]) =>
      populationFactor({ player: () => 'p' } as never, {
        cityImprovementRegistry: { getByCity: () => [] } as never,
        playerResearchRegistry: {
          getByPlayer: () => ({
            completed: (Advance: Function) => known.includes(Advance),
          }),
        } as never,
      });

    expect(knowing(Industrialization)).to.equal(2);
    expect(knowing(Industrialization, Sanitation)).to.equal(1);
    expect(knowing(Industrialization, Sanitation, Environmentalism)).to.equal(
      0
    );
  });

  it('Pollution says the tolerance comes off the whole, and a Solar Plant says it takes it away', (): void => {
    expect(
      pollution()
        .flatMap((rule) => rule.descriptions())
        .filter(({ type }) => type === 'pollution_tolerance')
    ).to.eql([{ type: 'pollution_tolerance', subject: Pollution, value: 20 }]);
    expect(
      pollution()
        .flatMap((rule) => rule.descriptions())
        .filter(({ type }) => type === 'pollution_tolerance_removed')
    ).to.eql([
      {
        type: 'pollution_tolerance_removed',
        subject: CityImprovements.SolarPlant,
        value: 20,
      },
    ]);
  });

  it('Pollution says what causes it: shields, and people for each polluting advance known', (): void => {
    expect(
      pollution()
        .flatMap((rule) => rule.descriptions())
        .filter(({ type }) => type === 'caused_by')
    ).to.eql([
      { type: 'caused_by', subject: Pollution, source: 'production' },
      {
        type: 'caused_by',
        subject: Pollution,
        source: 'population',
        with: pollutingAdvances,
      },
    ]);
  });

  it('a city defence multiplies the defence it says, against what it says', (): void => {
    const cases = described(strength());

    expect(cases.length).to.equal(3);

    cases.forEach(([, description]): void => {
      const Subject = description.subject as Class,
        r = registries(),
        city = cityOf('p'),
        [Against] = description.against as Function[],
        attacker =
          Against === SingleUse
            ? unit(Plane, { attack: () => new Attack(18) }, [SingleUse])
            : unit(Against === Naval ? Ship : Plane, {
                attack: () => new Attack(12),
              }),
        [rule] = strength(
          { getByTile: () => city } as any,
          r.cityImprovementRegistry
        ).filter((rule) => rule.descriptions()[0].subject === Subject),
        defence = new Defence(3),
        defender = unit(Soldier, { tile: () => ({}) });

      r.cityImprovementRegistry.register(built(Subject as any, city));

      expect(rule.validate(attacker, defender, new Attack(1), defence)).to.true;
      rule.process(attacker, defender, new Attack(1), defence);
      expect(defence.value() / 3, Subject.name).to.equal(description.value);

      // Not for what it says it isn't.
      ((description.notFor as Function[] | undefined) ?? []).forEach(
        () =>
          expect(
            rule.validate(
              attacker,
              unit(Ship, { tile: () => ({}) }),
              new Attack(1),
              new Defence(3)
            )
          ).to.false
      );
    });
  });

  it('new units of the type it says are veterans, with the improvement or (anywhere) the Wonder', (): void => {
    const cases = described(unitCreated());

    expect(cases.length).to.equal(5);

    cases.forEach(([, description]): void => {
      const Subject = description.subject as Class,
        Domain = description.unit as Function,
        r = registries(),
        city = cityOf('p'),
        unitImprovementRegistry = new UnitImprovementRegistry(),
        [rule] = unitCreated(
          unitImprovementRegistry,
          { get: () => [], process: () => [] } as any,
          r
        ).filter((rule) =>
          rule.descriptions().some((other) => other.subject === Subject)
        ),
        made = unit(
          Domain === Land ? Soldier : Domain === Naval ? Ship : Plane,
          { city: () => city }
        );

      if (isWonder(Subject)) {
        expect(description.scope).to.equal('player');
        // In another of its owner's cities.
        r.wonders.push(built(Subject as any, cityOf('p')));
      } else {
        r.cityImprovementRegistry.register(built(Subject as any, city));
      }

      expect(rule.validate(made), Subject.name).to.true;
      rule.process(made);
      expect(
        unitImprovementRegistry
          .getByUnit(made)
          .some((improvement) => improvement instanceof Veteran)
      ).to.true;
    });
  });

  it('under Democracy a Courthouse or the Palace makes one content citizen happy, one between them', (): void => {
    const happy = (...Improvements: Class[]): number => {
        const r = registries(),
          city = cityOf('p'),
          yields = [new Unhappiness(10)];

        Improvements.forEach((Improvement) =>
          r.cityImprovementRegistry.register(built(Improvement as any, city))
        );

        const [rule] = cost({
          ...r,
          clientRegistry: playedBy('p'),
          gameDifficultyRegistry: atLevel(5),
          playerGovernmentRegistry: governedBy(Democracy),
        }).filter((rule) =>
          rule
            .descriptions()
            .some((description) => description.type === 'happy')
        );

        return rule.validate(city, yields)
          ? (rule.process(city, yields) as Yield).value()
          : 0;
      },
      lines = described(cost()).filter(
        ([, description]) => description.type === 'happy'
      );

    expect(lines.length).to.equal(2);
    lines.forEach(([, description]): void => {
      expect(description.with).to.eql([Democracy]);
      expect(happy(description.subject as Class)).to.equal(description.value);
    });
    expect(
      happy(CityImprovements.Courthouse, CityImprovements.Palace)
    ).to.equal(1);
  });

  it("what's free under Fundamentalism, and with Adam Smith's, costs nothing", (): void => {
    const free = described(cost()).filter(
        ([, description]) =>
          description.type === 'upkeep' && description.with !== undefined
      ),
      fundamentalist = upkeepFor('p' as any, {
        ...registries(),
        gameDifficultyRegistry: atLevel(5),
        playerGovernmentRegistry: governedBy(Fundamentalism),
      });

    expect(free.length).to.equal(3);
    free.forEach(([, description]): void => {
      expect(description.with).to.eql([Fundamentalism]);
      expect(description.yield).to.equal(CityImprovementMaintenanceGold);
      expect(fundamentalist(description.subject as any)).to.equal(
        description.value
      );
    });

    const [[, smith]] = described(cost()).filter(
        ([, description]) => description.type === 'pays_upkeep'
      ),
      r = registries([], []),
      withSmith = upkeepFor('p' as any, {
        ...r,
        gameDifficultyRegistry: atLevel(5),
        playerGovernmentRegistry: governedBy(Democracy),
      });

    r.wonders.push(built(smith.subject as any, cityOf('p')));

    improvements
      .filter(
        ([Improvement, , upkeep]) =>
          upkeep === smith.value && Improvement !== CityImprovements.Barracks
      )
      .forEach(([Improvement]): void => {
        expect(withSmith(Improvement), Improvement.name).to.equal(0);
      });
  });

  it("the tithes are the content the improvements (and J. S. Bach's) say they make, under Fundamentalism", (): void => {
    const r = registries([CeremonialBurial, Mysticism, Monotheism, Theology]),
      city = cityOf('p'),
      [rule] = yieldRules({
        ...r,
        playerGovernmentRegistry: governedBy(Fundamentalism),
      }).filter((rule) =>
        rule.descriptions().some((description) => description.type === 'tithe')
      ),
      lines = rule.descriptions();

    expect(lines.map((description) => description.subject)).to.eql([
      CityImprovements.Colosseum,
      CityImprovements.Cathedral,
      CityImprovements.Temple,
      Wonders.JsBachsCathedral,
    ]);
    lines.forEach((description) =>
      expect(description.with).to.eql([Fundamentalism])
    );

    r.cityImprovementRegistry.register(
      built(CityImprovements.Temple, city),
      built(CityImprovements.Cathedral, city)
    );
    r.wonders.push(built(Wonders.JsBachsCathedral, cityOf('p')));

    // A Temple's 2, a Cathedral's 3 (Theology, no Communism: 3 − 0 + 1 = 4) and Bach's 2.
    expect(rule.validate(city, [])).to.true;
    expect((rule.process(city, []) as Yield).value()).to.equal(2 + 4 + 2);
  });

  it("Michelangelo's and the Pyramids act as the building they say", (): void => {
    const contentOf = (Source: Class): number => {
        const r = registries([Monotheism]),
          city = cityOf('p'),
          yields = [new Unhappiness(10)];

        if (isWonder(Source)) {
          r.wonders.push(built(Source as any, cityOf('p')));
        } else {
          r.cityImprovementRegistry.register(built(Source as any, city));
        }

        return cost({
          ...r,
          clientRegistry: playedBy('p'),
          gameDifficultyRegistry: atLevel(5),
          playerGovernmentRegistry: governedBy(Democracy),
        })
          .filter((rule) =>
            rule
              .descriptions()
              .some((description) => description.type === 'acts_as')
          )
          .reduce(
            (total, rule) =>
              rule.validate(city, yields)
                ? total + (rule.process(city, yields) as Yield).value()
                : total,
            0
          );
      },
      grown = (Source: Class): Yield[] => {
        const r = registries(),
          city = cityOf('p'),
          added: Yield[] = [];

        if (isWonder(Source)) {
          r.wonders.push(built(Source as any, cityOf('p')));
        } else {
          r.cityImprovementRegistry.register(built(Source as any, city));
        }

        const [rule] = grow(r),
          growth = {
            city: () => city,
            size: () => 3,
            add: (value: Yield) => added.push(value),
          };

        if (rule.validate(growth)) {
          rule.process(growth);
        }

        return added;
      },
      actsAs = described([...cost(), ...grow()]).filter(
        ([, description]) => description.type === 'acts_as'
      );

    expect(actsAs.map(([, description]) => description.subject)).to.eql([
      Wonders.MichelangelosChapel,
      Wonders.Pyramids,
    ]);

    const [[, michelangelo], [, pyramids]] = actsAs;

    expect(contentOf(michelangelo.subject as Class)).to.not.equal(0);
    expect(contentOf(michelangelo.subject as Class)).to.equal(
      contentOf(michelangelo.improvement as Class)
    );
    expect(grown(pyramids.subject as Class).length).to.equal(1);
    expect(grown(pyramids.subject as Class)[0].value()).to.equal(
      grown(pyramids.improvement as Class)[0].value()
    );
  });

  it('a city grows no larger than the sizes it says without each building', (): void => {
    const [, rule] = grow(),
      lines = rule.descriptions();

    expect(lines).to.eql(
      growthLimits.map(([size, Improvement]) => ({
        type: 'size_limit',
        subject: Improvement,
        value: size,
      }))
    );
  });

  // civ-clone/web-renderer#1291.

  it('says something of the Barracks, Solar Plant and Palace in each rule #1291 covers', (): void => {
    const subjectsOf = (rules: Rule[], type: string): unknown[] =>
      described(rules)
        .filter(([, description]) => description.type === type)
        .map(([, description]) => description.subject);

    expect(subjectsOf(researchComplete(), 'sold_on')).eql([
      CityImprovements.Barracks,
      CityImprovements.Barracks,
    ]);
    expect(subjectsOf(globalWarming(), 'global_warming')).eql([
      CityImprovements.SolarPlant,
    ]);
    expect(subjectsOf(pollution(), 'pollution_step')).eql([
      CityImprovements.SolarPlant,
      Sanitation,
      Environmentalism,
    ]);
    expect(subjectsOf(improvementCreated(), 'relocates')).eql([
      CityImprovements.Palace,
    ]);
    expect(subjectsOf(captured(), 'palace_escape')).eql([
      CityImprovements.Palace,
    ]);
    expect(subjectsOf(cityCreated(), 'free_in_first_city')).eql([
      CityImprovements.Palace,
    ]);
    expect(subjectsOf(captured(), 'lost_on_capture')).to.include.members([
      CityImprovements.Palace,
      CityImprovements.Temple,
      CityImprovements.Barracks,
    ]);
  });

  it('Barracks cost what they say, below Prince and from it up, with each advance that raises them', (): void => {
    expect(Prince.level()).to.equal(barracksPrinceLevel);

    const lines = described(cost())
      .map(([, description]) => description)
      .filter(
        (description) =>
          description.type === 'upkeep' &&
          description.subject === CityImprovements.Barracks
      );

    expect(lines.length).to.equal(2 * (barracksAdvances.length + 1));

    lines.forEach((description): void => {
      expect(
        (description.below ?? description.atLeast) === Prince,
        'below or at least Prince'
      ).to.true;

      const known =
          description.from === undefined
            ? []
            : barracksAdvances.slice(
                0,
                barracksAdvances.indexOf(description.from as any) + 1
              ),
        until = barracksAdvances.indexOf(description.until as any);

      if (description.until !== undefined) {
        expect(until).to.equal(known.length);
      }

      expect(
        upkeep(CityImprovements.Barracks, 'p' as any, {
          ...registries(known),
          gameDifficultyRegistry: atLevel(
            description.below === Prince ? Prince.level() - 1 : Prince.level()
          ),
          playerGovernmentRegistry: governedBy(Democracy),
        }),
        JSON.stringify([description.below !== undefined, known.length])
      ).to.equal(description.value);
    });
  });

  it('each research rule sells the Barracks on the advance it says', (): void => {
    researchComplete().forEach((rule): void => {
      const [description] = rule.descriptions(),
        [Advance] = description.with as any[];

      expect(rule).to.be.instanceOf(Complete);
      expect(rule.validate({} as any, new Advance())).to.true;
      barracksAdvances
        .filter((Other) => Other !== Advance)
        .forEach((Other: any): void => {
          expect(rule.validate({} as any, new Other())).to.false;
        });
    });

    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p'),
      barracks = built(CityImprovements.Barracks, city);

    r.cityImprovementRegistry.register(barracks);
    ruleRegistry.register(
      ...researchComplete(
        r.cityImprovementRegistry,
        { getByPlayer: () => [city] } as any,
        new Engine(),
        { getByPlayer: () => [] } as any
      )
    );
    ruleRegistry.process(
      Complete,
      { player: () => 'p' } as any,
      new (barracksAdvances[0] as any)()
    );

    expect(barracks.destroyed()).to.true;
  });

  it('a new Palace, which says it relocates, moves the capital', (): void => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      rules = improvementCreated(r.cityImprovementRegistry, new Engine()),
      [moves] = rules.filter((rule) =>
        rule
          .descriptions()
          .some((description) => description.type === 'relocates')
      );

    expect(moves.id()).to.equal(
      'civ2-city-improvement:city-improvement/created/move-capital'
    );
    expect(rules.map((rule) => rule.id())).to.eql([
      'civ2-city-improvement:city-improvement/created/register',
      'civ2-city-improvement:city-improvement/created/move-capital',
      'civ2-city-improvement:city-improvement/created/emit',
    ]);

    ruleRegistry.register(...rules);

    const first = new CityImprovements.Palace(cityOf('p'), ruleRegistry),
      second = new CityImprovements.Palace(cityOf('p'), ruleRegistry);

    expect(first.destroyed()).to.true;
    expect(second.destroyed()).to.false;
  });

  it('each city with a Solar Plant takes a step off the warming target', (): void => {
    const target = (solarPlants: number): number => {
      const r = registries(),
        [rule] = globalWarming({
          cityImprovementRegistry: r.cityImprovementRegistry,
        }).filter((rule) => rule instanceof WarmingTarget);

      for (let i = 0; i < solarPlants; i++) {
        r.cityImprovementRegistry.register(
          built(CityImprovements.SolarPlant, cityOf('p'))
        );
      }

      expect(rule.descriptions()).to.eql([
        {
          type: 'global_warming',
          subject: CityImprovements.SolarPlant,
          step: 'fewer',
        },
      ]);

      return rule.process(10, 0) as number;
    };

    expect(target(0) - target(1)).to.equal(1);
    expect(target(0) - target(3)).to.equal(3);
  });

  it("a Solar Plant takes the steps it says off its citizens' pollution", (): void => {
    const [[, line]] = described(pollution()).filter(
        ([, description]) => description.type === 'pollution_step'
      ),
      factor = (solarPlant: boolean): number => {
        const r = registries([Industrialization, Sanitation]),
          city = cityOf('p');

        if (solarPlant) {
          r.cityImprovementRegistry.register(
            built(CityImprovements.SolarPlant, city)
          );
        }

        return populationFactor(city, r);
      };

    expect(line.source).to.equal('population');
    expect(factor(false) - factor(true)).to.equal(line.value);
  });

  it('a captured city loses what it says, always or at the chance it says', (): void => {
    const lines = described(captured()).filter(
        ([, description]) => description.type === 'lost_on_capture'
      ),
      chance = (
        roll: number,
        founder: unknown = 'someone',
        cause: unknown = null
      ) => {
        const r = registries(),
          ruleRegistry = new RuleRegistry(),
          city = cityOf('taker', { originalPlayer: () => founder }),
          standing = improvements.map(([Improvement]) =>
            built(Improvement as typeof CityImprovement, city)
          );

        r.cityImprovementRegistry.register(...standing);
        ruleRegistry.register(
          ...captured(
            {
              ...r,
              cityRegistry: { getByPlayer: () => [] } as any,
              clientRegistry: playedBy(),
              gameDifficultyRegistry: atLevel(0),
            },
            () => roll
          )
        );
        ruleRegistry.process(
          Captured,
          city,
          'taker' as any,
          'loser' as any,
          cause
        );

        return (Improvement: unknown): boolean =>
          standing
            .find((improvement) => improvement instanceof (Improvement as any))!
            .destroyed();
      },
      // The roll's two outcomes: below the chance to keep the odd rows, and above it.
      keepOdd = captureKeepOddRowsChance,
      [low, high] = [chance(keepOdd / 2), chance((1 + keepOdd) / 2)];

    expect(lines.map(([, description]) => description.subject)).to.have.members(
      improvements.map(([Improvement]) => Improvement)
    );

    lines.forEach(([, description]): void => {
      const lost =
        keepOdd * Number(low(description.subject)) +
        (1 - keepOdd) * Number(high(description.subject));

      expect(lost, (description.subject as Class).name).to.equal(
        description.value ?? 1
      );
    });

    // Everything but the Palace is lost only unless the founder takes the city back, which keeps it whatever the roll.
    const unlessFounder = lines.filter(
        ([, description]) => description.unless === 'founder'
      ),
      chanceLines = unlessFounder.filter(
        ([, description]) => description.value !== undefined
      ),
      rolls = [keepOdd / 2, (1 + keepOdd) / 2];

    expect(
      unlessFounder.map(([, description]) => description.subject)
    ).to.have.members(
      improvements
        .map(([Improvement]) => Improvement)
        .filter((Improvement) => Improvement !== CityImprovements.Palace)
    );
    expect(
      chanceLines.map(([, description]) => description.subject)
    ).to.include(CityImprovements.Marketplace);

    rolls.forEach((roll): void => {
      const retaken = chance(roll, 'taker'),
        incited = chance(
          roll,
          'someone',
          Object.create(InciteRevolt.prototype)
        );

      unlessFounder.forEach(([, description]): void => {
        expect(
          retaken(description.subject),
          `retaken: ${(description.subject as Class).name}`
        ).to.false;
      });
      expect(retaken(CityImprovements.Palace)).to.true;

      // Incited, the chance lines are all kept; those always lost still are.
      chanceLines.forEach(([, description]): void => {
        expect(
          incited(description.subject),
          `incited: ${(description.subject as Class).name}`
        ).to.false;
      });
      [
        CityImprovements.Temple,
        CityImprovements.Cathedral,
        CityImprovements.Courthouse,
      ].forEach((Improvement): void => {
        expect(incited(Improvement), `incited: ${Improvement.name}`).to.true;
      });
    });
  });

  it('the Palace says what its escape costs, in the gold its owner pays', (): void => {
    const [rule] = captured().filter(
      (rule) =>
        rule.id() === 'civ2-city-improvement:city/captured/palace-escape'
    );

    expect(rule.descriptions()).to.eql([
      {
        type: 'palace_escape',
        subject: CityImprovements.Palace,
        value: palaceEscapeCost,
        yield: Gold,
      },
    ]);
  });

  it("a player's first city, which says it gets the Palace free, gets it, and a second doesn't", (): void => {
    const r = registries(),
      cities: unknown[] = [],
      [rule] = cityCreated(
        { getByPlayer: () => cities } as any,
        r.cityImprovementRegistry,
        new RuleRegistry()
      ),
      found = (): unknown => {
        const city = cityOf('p');

        cities.push(city);

        if (rule.validate(city)) {
          rule.process(city);
        }

        return city;
      };

    expect(rule).to.be.instanceOf(CityCreated);
    expect(rule.id()).to.equal('civ2-city-improvement:city/created/palace');
    expect(rule.descriptions()).to.eql([
      { type: 'free_in_first_city', subject: CityImprovements.Palace },
    ]);

    const first = found(),
      second = found();

    expect(
      r.cityImprovementRegistry
        .getByType(CityImprovements.Palace)
        .map((palace) => palace.city())
    ).to.eql([first]);
    expect(second).to.not.equal(first);
  });
});
