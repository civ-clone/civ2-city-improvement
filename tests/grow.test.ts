import { Aqueduct, Granary, SewerSystem } from '../CityImprovements';
import { built, cityOf, instanceOf, registries } from './lib/stubs';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
import { Pyramids } from '../Wonders';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import grow from '../Rules/City/grow';

// What civ2-city's `Grow` rules leave: an empty box at the new size. `size` is the size just grown to.
const growing = (size: number) => {
  const r = registries(),
    ruleRegistry = new RuleRegistry(),
    city = cityOf(),
    state = { size, stored: 0, shrunk: [] as unknown[] },
    cityGrowth = instanceOf(CityGrowth, {
      city: () => city,
      size: () => state.size,
      add: (y: any) => (state.stored += y.value()),
      shrink: (cause: unknown) => {
        state.size--;
        state.shrunk.push(cause);
      },
    });

  ruleRegistry.register(...grow(r));

  return {
    r,
    city,
    state,
    process: () => ruleRegistry.process(Grow, cityGrowth),
  };
};

describe('city:grow', (): void => {
  it('a Granary (or the Pyramids) leaves half a box: (size + 1) × 5', (): void => {
    const plain = growing(4);

    plain.process();
    expect(plain.state.stored).equal(0);

    const granary = growing(4);

    granary.r.cityImprovementRegistry.register(built(Granary, granary.city));
    granary.process();
    expect(granary.state.stored).equal(25);

    const pyramids = growing(4);

    pyramids.r.wonders.push(built(Pyramids, cityOf()));
    pyramids.process();
    expect(pyramids.state.stored).equal(25);
  });

  it("a city grown past 8 without an Aqueduct, or past 12 without a Sewer System, shrinks back, keeping the Granary's box", (): void => {
    const nine = growing(9);

    nine.r.cityImprovementRegistry.register(built(Granary, nine.city));
    nine.process();
    expect([nine.state.size, nine.state.shrunk, nine.state.stored]).eql([
      8,
      [Aqueduct],
      50,
    ]);

    const eight = growing(8);

    eight.process();
    expect(eight.state.size).equal(8);

    const thirteen = growing(13);

    thirteen.r.cityImprovementRegistry.register(built(Aqueduct, thirteen.city));
    thirteen.process();
    expect([thirteen.state.size, thirteen.state.shrunk]).eql([
      12,
      [SewerSystem],
    ]);

    const sewer = growing(13);

    sewer.r.cityImprovementRegistry.register(
      built(Aqueduct, sewer.city),
      built(SewerSystem, sewer.city)
    );
    sewer.process();
    expect(sewer.state.size).equal(13);
  });
});
