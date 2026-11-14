import { Palace, Temple } from '../CityImprovements';
import { cityOf, registries } from './lib/stubs';
import Destroyed from '@civ-clone/core-city/Rules/Destroyed';
import Engine from '@civ-clone/core-engine/Engine';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Wonder from '@civ-clone/core-wonder/Wonder';
import cityDestroyed from '../Rules/City/destroyed';
import { expect } from 'chai';
import improvementCreated from '../Rules/CityImprovement/created';

class TestWonder extends Wonder {}

describe('city-improvement:created', (): void => {
  const setUp = () => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      told: unknown[] = [];

    ruleRegistry.register(
      ...improvementCreated(r.cityImprovementRegistry, engine),
      ...cityDestroyed(r.cityImprovementRegistry)
    );
    engine.on('city-improvement:created', (improvement) =>
      told.push(improvement)
    );

    return { r, ruleRegistry, told };
  };

  it('registers every improvement built, Wonders included, and tells the engine', (): void => {
    const { r, ruleRegistry, told } = setUp(),
      city = cityOf('p'),
      temple = new Temple(city, ruleRegistry),
      wonder = new TestWonder(city, ruleRegistry);

    expect(r.cityImprovementRegistry.getByCity(city)).eql([temple, wonder]);
    expect(told).eql([temple, wonder]);
  });

  it("keeps a Wonder known as ever built once its city is destroyed (base-wonder's `everBuilt` asks)", (): void => {
    const { r, ruleRegistry } = setUp(),
      city = cityOf('p'),
      wonder = new TestWonder(city, ruleRegistry);

    ruleRegistry.process(Destroyed, city, null);

    expect(wonder.destroyed()).true;
    expect(r.cityImprovementRegistry.getByType(TestWonder)).eql([]);
    expect(r.cityImprovementRegistry.getByType(TestWonder, true)).eql([wonder]);
  });

  it("a new Palace destroys its player's old one, not another player's", (): void => {
    const { r, ruleRegistry } = setUp(),
      first = new Palace(cityOf('p'), ruleRegistry),
      theirs = new Palace(cityOf('q'), ruleRegistry),
      second = new Palace(cityOf('p'), ruleRegistry);

    expect([first, theirs, second].map((palace) => palace.destroyed())).eql([
      true,
      false,
      false,
    ]);
    expect(r.cityImprovementRegistry.getByType(Palace)).eql([theirs, second]);
  });
});
