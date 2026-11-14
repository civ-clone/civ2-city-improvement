import {
  Anarchy,
  Democracy,
  Despotism,
} from '@civ-clone/civ2-government/Governments';
import {
  Cathedral,
  Colosseum,
  Courthouse,
  Library,
  Palace,
  Temple,
} from '../CityImprovements';
import {
  CeremonialBurial,
  Communism,
  Electronics,
  Monotheism,
  Mysticism,
  Theology,
} from '@civ-clone/civ2-science/Advances';
import {
  CityImprovementContent,
  CityImprovementMaintenanceGold,
  Happiness,
  Unhappiness,
} from '../Yields';
import { MichelangelosChapel, Oracle } from '../Wonders';
import {
  atLevel,
  built,
  cityOf,
  governedBy,
  playedBy,
  registries,
} from './lib/stubs';
import { cathedral, colosseum, temple } from '../lib/content';
import Cost from '@civ-clone/core-city/Rules/Cost';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import cost from '../Rules/City/cost';
import MilitaryUnhappiness from '@civ-clone/base-city-yield-military-unhappiness/MilitaryUnhappiness';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import Effect from '@civ-clone/core-rule/Effect';
import YieldRule from '@civ-clone/core-city/Rules/Yield';
import { expect } from 'chai';

describe('lib/content', (): void => {
  it('a Temple: 1 with Ceremonial Burial, 1 with Mysticism, doubled by the Oracle', (): void => {
    const city = cityOf(),
      r = registries([CeremonialBurial]);

    expect(temple(city, r)).null;
    r.cityImprovementRegistry.register(built(Temple, city));
    expect(temple(city, r)!.value).equal(1);
    r.known.push(Mysticism);
    expect(temple(city, r)!.value).equal(2);
    r.wonders.push(built(Oracle, cityOf()));
    expect(temple(city, r)!.value).equal(4);
  });

  it('a Colosseum: 3, 4 with Electronics', (): void => {
    const city = cityOf(),
      r = registries();

    r.cityImprovementRegistry.register(built(Colosseum, city));
    expect(colosseum(city, r)!.value).equal(3);
    r.known.push(Electronics);
    expect(colosseum(city, r)!.value).equal(4);
  });

  it("a Cathedral or Michelangelo's, with Monotheism: 3, 1 fewer without Theology, 1 more without Communism", (): void => {
    const city = cityOf(),
      r = registries();

    r.cityImprovementRegistry.register(built(Cathedral, city));
    expect(cathedral(city, r)).null;
    r.known.push(Monotheism);
    expect(cathedral(city, r)!.value).equal(3);
    r.known.push(Theology);
    expect(cathedral(city, r)!.value).equal(4);
    r.known.push(Communism);
    expect(cathedral(city, r)!.value).equal(3);

    const other = cityOf(),
      michelangelos = built(MichelangelosChapel, cityOf());

    expect(cathedral(other, r)).null;
    r.wonders.push(michelangelos);
    expect(cathedral(other, r)!.source).equal(michelangelos);
    expect(cathedral(other, r)!.value).equal(3);
  });
});

describe('city:cost', (): void => {
  const setUp = (Government: any = Despotism, humans: unknown[] = ['p']) => {
    const r = registries([CeremonialBurial, Mysticism]),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p');

    ruleRegistry.register(
      ...cost({
        ...r,
        clientRegistry: playedBy(...humans),
        gameDifficultyRegistry: atLevel(3),
        playerGovernmentRegistry: governedBy(Government),
      })
    );

    const costs = (unhappy = 0): Yield[] =>
      (
        ruleRegistry.process(Cost, city, [new Unhappiness(unhappy)]) as any
      ).flat();

    return { city, costs, r };
  };

  it("charges a person's city each improvement's upkeep, carrying it, in @IMPROVE order, but not a free one", (): void => {
    const { city, costs, r } = setUp(),
      library = built(Library, city),
      temple = built(Temple, city);

    r.cityImprovementRegistry.register(built(Palace, city), library, temple);

    const upkeep = costs().filter(
      (y) => y instanceof CityImprovementMaintenanceGold
    );

    // The Temple's row (4) comes before the Library's (6), whatever order they were built in.
    expect(upkeep.map((y) => [y.value(), (y as any).cityImprovement()])).eql([
      [-1, temple],
      [-1, library],
    ]);
  });

  it("charges a computer player's city nothing, nor anyone's under Anarchy", (): void => {
    [setUp(Despotism, []), setUp(Anarchy)].forEach(({ city, costs, r }) => {
      r.cityImprovementRegistry.register(built(Library, city));

      expect(
        costs().filter((y) => y instanceof CityImprovementMaintenanceGold)
      ).eql([]);
    });
  });

  it('makes citizens content, Colosseum first, never more than are unhappy, through `City#yields()`', (): void => {
    const r = registries([CeremonialBurial, Mysticism]),
      ruleRegistry = new RuleRegistry(),
      unhappy = { count: 4 },
      city = cityOf('p', { _ruleRegistry: ruleRegistry });

    ruleRegistry.register(
      new YieldRule(
        'born-unhappy',
        new Effect((): Yield => new Unhappiness(unhappy.count))
      ),
      ...cost({
        ...r,
        clientRegistry: playedBy('p'),
        gameDifficultyRegistry: atLevel(3),
        playerGovernmentRegistry: governedBy(Despotism),
      })
    );
    r.cityImprovementRegistry.register(
      built(Temple, city),
      built(Colosseum, city)
    );

    const content = () =>
      city
        .yields()
        .filter((y) => y instanceof CityImprovementContent)
        .map((y) => [
          (y as any).cityImprovement().constructor.name,
          -y.value(),
        ]);

    // 4 unhappy: the Colosseum's 3, then 1 of the Temple's 2.
    expect(content()).eql([
      ['Colosseum', 3],
      ['Temple', 1],
    ]);

    unhappy.count = 2;
    expect(content()).eql([['Colosseum', 2]]);

    unhappy.count = 6;
    expect(content()).eql([
      ['Colosseum', 3],
      ['Temple', 2],
    ]);
  });

  it("doesn't calm military unhappiness, which Civ2 adds after the improvements", (): void => {
    const r = registries([CeremonialBurial, Mysticism]),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p', { _ruleRegistry: ruleRegistry });

    // Democracy: 1 born unhappy, one aggressive unit abroad making 2 more, and a Temple worth 2.
    ruleRegistry.register(
      new YieldRule(
        'born-unhappy',
        new Effect((): Yield => new Unhappiness(1))
      ),
      new YieldRule(
        'military',
        new Effect(
          (): Yield => new MilitaryUnhappiness(2, { id: () => 'unit' } as any)
        )
      ),
      ...cost({
        ...r,
        clientRegistry: playedBy('p'),
        gameDifficultyRegistry: atLevel(3),
        playerGovernmentRegistry: governedBy(Democracy),
      })
    );
    r.cityImprovementRegistry.register(built(Temple, city));

    expect(reduceYield(city.yields(), Unhappiness)).equal(2);
  });

  it('under Democracy a Courthouse or the Palace makes one citizen happy', (): void => {
    const happy = ({ costs }: ReturnType<typeof setUp>) =>
      costs()
        .filter((y) => y instanceof Happiness)
        .map((y) => y.value());

    const democracy = setUp(Democracy);

    expect(happy(democracy)).eql([]);
    democracy.r.cityImprovementRegistry.register(
      built(Courthouse, democracy.city)
    );
    expect(happy(democracy)).eql([1]);

    const despotism = setUp(Despotism);

    despotism.r.cityImprovementRegistry.register(built(Palace, despotism.city));
    expect(happy(despotism)).eql([]);
  });
});
