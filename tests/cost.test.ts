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

  it("charges a person's city each improvement's upkeep, carrying it, but not a free one", (): void => {
    const { city, costs, r } = setUp(),
      library = built(Library, city);

    r.cityImprovementRegistry.register(built(Palace, city), library);

    const upkeep = costs().filter(
      (y) => y instanceof CityImprovementMaintenanceGold
    );

    expect(upkeep.map((y) => [y.value(), (y as any).cityImprovement()])).eql([
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

  it('makes citizens content, Colosseum first, never more than are unhappy', (): void => {
    const { city, costs, r } = setUp();

    r.cityImprovementRegistry.register(
      built(Temple, city),
      built(Colosseum, city)
    );

    const content = (unhappy: number) =>
      costs(unhappy)
        .filter((y) => y instanceof CityImprovementContent)
        .map((y) => [
          (y as any).cityImprovement().constructor.name,
          -y.value(),
        ]);

    expect(content(4)).eql([
      ['Colosseum', 3],
      ['Temple', 2],
    ]);
    expect(content(2)[0]).eql(['Colosseum', 2]);
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
