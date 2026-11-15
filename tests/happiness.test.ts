import { CeremonialBurial, Mysticism } from '@civ-clone/civ2-science/Advances';
import { Colosseum, Temple } from '../CityImprovements';
import { Luxuries } from '../Yields';
import {
  atLevel,
  built,
  cityOf,
  governedBy,
  playedBy,
  registries,
} from './lib/stubs';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import Cost from '@civ-clone/core-city/Rules/Cost';
import { Monarchy } from '@civ-clone/civ2-government/Governments';
import PopulationUnhappiness from '@civ-clone/base-city-yield-population-unhappiness/PopulationUnhappiness';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import civilDisorder from '@civ-clone/civ2-city-happiness/Rules/City/civil-disorder';
import cost from '../Rules/City/cost';
import { expect } from 'chai';
import happinessCost from '@civ-clone/civ2-city-happiness/Rules/City/cost';
import { stagedHappiness } from '@civ-clone/civ2-city-happiness/lib/stagedHappiness';

// The content citizens of this package's buildings, as civ2-city-happiness stages them (OpenCiv2
//  `city_calc_trade_happiness`, richardpenman/civ2@49f26ec), with both packages' real `Cost` rules.
describe("with civ2-city-happiness's stages", (): void => {
  const setUp = (Improvements: any[], luxuries: number) => {
    const r = registries([CeremonialBurial, Mysticism]),
      ruleRegistry = new RuleRegistry(),
      city = cityOf('p'),
      governments = governedBy(Monarchy),
      growth = { getByCity: () => ({ size: () => 6 }) } as any,
      specialists = { getByCity: () => [] } as any;

    r.cityImprovementRegistry.register(
      ...Improvements.map((Improvement) => built(Improvement, city))
    );
    ruleRegistry.register(
      ...happinessCost(governments, { getByTile: () => [] } as any),
      ...cost({
        ...r,
        clientRegistry: playedBy('p'),
        gameDifficultyRegistry: atLevel(5),
        playerGovernmentRegistry: governments,
      }),
      ...civilDisorder(growth, specialists, governments)
    );

    // As `City#yields` runs them: civ2-city-happiness's base (7 unhappy in a city of 6), the luxuries, then the costs.
    const yields: Yield[] = [
      new PopulationUnhappiness(7),
      new Luxuries(luxuries),
    ];

    ruleRegistry.get(Cost).forEach((rule: Cost): void => {
      if (rule.validate(city, yields)) {
        const result = rule.process(city, yields);

        yields.push(...(Array.isArray(result) ? result : [result]));
      }
    });

    return {
      disorder: ruleRegistry
        .process(CivilDisorder, city, yields)
        .some((result) => result),
      staged: stagedHappiness(city, yields, {
        cityGrowthRegistry: growth,
        playerGovernmentRegistry: governments,
        specialistRegistry: specialists,
      }),
      yields,
    };
  };

  it('spends a Temple on the angry citizen before a plain unhappy one', (): void => {
    // Base: 6 unhappy, 1 angry. Luxuries 4: 2 happy, and the overflow takes the angry citizen and then a happy one
    //  with an unhappy one: (1, 4, 0). The Temple's 2: (1, 2, 0). 1 happy against 2 unhappy: disorder.
    const { disorder, staged } = setUp([Temple], 4);

    expect(
      staged.stages.map(({ name, happy, unhappy, angry }) => [
        name,
        happy,
        unhappy,
        angry,
      ])
    ).eql([
      ['base', 0, 6, 1],
      ['luxuries', 1, 4, 0],
      ['buildings', 1, 2, 0],
      ['units', 1, 2, 0],
      ['wonders', 1, 2, 0],
    ]);
    expect(disorder).true;
  });

  it("leaves 2 unhappy after the Colosseum's 3 and the Temple's 2: the angry citizen takes two of them", (): void => {
    // Base (0, 6, 1); no luxuries; 5 content: 1 unhappy, then the angry citizen comes back as unhappy while there's
    //  room: 2.
    const { disorder, staged } = setUp([Temple, Colosseum], 0);

    expect([staged.happy, staged.unhappy, staged.angry]).eql([0, 2, 0]);
    expect(disorder).true;
  });
});
