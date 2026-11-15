import { Palace, SewerSystem } from '../CityImprovements';
import {
  atLevel,
  built,
  cityOf,
  governedBy,
  instanceOf,
  registries,
} from './lib/stubs';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import buildPriority from '../Rules/City/build-priority';
import { Despotism } from '@civ-clone/civ2-government/Governments';
import { expect } from 'chai';

describe('city:build-priority', (): void => {
  const setUp = () => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      sizes = new Map<City, number>(),
      small = cityOf('p'),
      large = cityOf('p');

    sizes.set(small, 3);
    sizes.set(large, 11);
    ruleRegistry.register(
      ...buildPriority({
        ...r,
        cityGrowthRegistry: {
          getByCity: (city: City) => ({ size: () => sizes.get(city) }),
        } as any,
        cityRegistry: { getByPlayer: () => [small, large] } as any,
        gameDifficultyRegistry: atLevel(3),
        playerGovernmentRegistry: governedBy(Despotism),
      })
    );

    const priority = (city: City, Item: unknown, auto = false): number[] =>
      ruleRegistry.process(
        BuildPriority,
        instanceOf(CityBuild, { city: () => city, auto: () => auto }),
        Item as any,
        []
      ) as number[];

    return { large, priority, r, small };
  };

  it("wants the Palace back in a player's largest city only while the player has none", (): void => {
    const { large, priority, r, small } = setUp();

    expect(priority(large, Palace)).eql([20]);
    expect(priority(small, Palace)).eql([0]);

    r.cityImprovementRegistry.register(built(Palace, small));

    expect(priority(large, Palace)).eql([0]);
  });

  it('wants a Sewer System near the Sewer size', (): void => {
    const { large, priority, small } = setUp();

    expect(priority(large, SewerSystem)[0]).greaterThan(0);
    expect(priority(small, SewerSystem)).eql([0]);
  });

  it("says nothing for a city on Auto, which civ2-city's own Civ2 scores rank", (): void => {
    const { large, priority } = setUp();

    expect(priority(large, Palace, true)).eql([]);
    expect(priority(large, SewerSystem, true)).eql([]);
  });
});
