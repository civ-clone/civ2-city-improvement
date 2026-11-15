import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import { Temple } from '../CityImprovements';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { BuildProgress } from '@civ-clone/core-city-build/Yields';
import Capitalization from '@civ-clone/base-city-improvement-capitalization/Capitalization';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Corporation } from '@civ-clone/civ2-science/Advances';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { buildCost } from '@civ-clone/core-city-build/Rules/BuildCost';
import { buildRequirements } from '../Requirements';
import capitalization from '../Rules/City/capitalization';
import { expect } from 'chai';
import setUpCity from '@civ-clone/core-city/tests/lib/setUpCity';

describe('Capitalization', (): void => {
  const setUp = async () => {
    const ruleRegistry = new RuleRegistry(),
      available = new AvailableCityBuildItemsRegistry(),
      city: City = await setUpCity('city', ruleRegistry),
      cityBuild = new CityBuild(city, available, ruleRegistry);

    available.register(Temple, Capitalization);
    ruleRegistry.register(
      new Build(
        new Effect((): IBuildCriterion => new Criterion((): boolean => true))
      ),
      ...buildCost(Temple, 40),
      ...capitalization()
    );

    return { cityBuild };
  };

  it('needs The Corporation (@IMPROVE row 38)', (): void => {
    const requirement = buildRequirements.find(
      (requirement) => requirement.subject === Capitalization
    );

    expect(requirement).not.undefined;
    expect(
      requirement!.targets.length === 1 &&
        requirement!.targets[0] === Corporation
    ).true;
  });

  it('costs nothing and never completes: the box keeps what it had (city_process_production)', async (): Promise<void> => {
    const { cityBuild } = await setUp();

    cityBuild.build(Temple);
    cityBuild.add(new BuildProgress(12));
    cityBuild.build(Capitalization);
    cityBuild.check();
    cityBuild.check();

    expect(cityBuild.building()!.item()).equal(Capitalization);
    expect(cityBuild.cost().value()).equal(0);
    // No conversion rule: what was in the box is kept, for civ2-city's production step to leave alone.
    expect(cityBuild.progress().value()).equal(12);
  });

  it('moves on to what is queued after it', async (): Promise<void> => {
    const { cityBuild } = await setUp();

    cityBuild.build(Capitalization);
    cityBuild.enqueue(Temple);
    cityBuild.check();

    expect(cityBuild.building()!.item()).equal(Temple);
  });

  it('is registered with civ2-city-improvement ids', (): void => {
    capitalization().forEach((rule) =>
      expect(rule.id()).match(/^civ2-city-improvement:/)
    );
  });
});
