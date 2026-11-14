import { Barracks, Temple } from '../CityImprovements';
import {
  Gunpowder,
  MobileWarfare,
  Writing,
} from '@civ-clone/civ2-science/Advances';
import { built, cityOf, registries } from './lib/stubs';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Engine from '@civ-clone/core-engine/Engine';
import { Gold } from '../Yields';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import researchComplete from '../Rules/Player/research-complete';

describe('player:research-complete', (): void => {
  it("sells every one of the player's Barracks for 40 gold each on Gunpowder and on Mobile Warfare", (): void => {
    const r = registries(),
      ruleRegistry = new RuleRegistry(),
      cities = [cityOf('p'), cityOf('p')],
      theirs = cityOf('q'),
      barracks = [...cities, theirs].map((city) => built(Barracks, city)),
      temple = built(Temple, cities[0]);
    let gold = 0;

    r.cityImprovementRegistry.register(...barracks, temple);
    ruleRegistry.register(
      ...researchComplete(
        r.cityImprovementRegistry,
        {
          getByPlayer: (player: unknown) =>
            player === 'p' ? cities : [theirs],
        } as any,
        new Engine(),
        {
          getByPlayer: () => [
            { yield: () => Gold, add: (n: number) => (gold += n) },
          ],
        } as any
      )
    );

    const research = { player: () => 'p' } as any;

    ruleRegistry.process(Complete, research, new Writing());
    expect(gold).equal(0);

    ruleRegistry.process(Complete, research, new Gunpowder());
    expect(barracks.map((b) => b.destroyed())).eql([true, true, false]);
    expect(temple.destroyed()).false;
    expect(gold).equal(80);

    ruleRegistry.process(Complete, research, new MobileWarfare());
    expect(gold).equal(80);
  });
});
