import { Corruption, Gold, Research, Trade } from '../Yields';
import { Courthouse, Granary, Palace } from '../CityImprovements';
import {
  Luxuries,
  Research as ResearchRate,
  Tax,
} from '@civ-clone/civ2-trade-rate/TradeRates';
import {
  atLevel,
  built,
  cityOf,
  governedBy,
  instanceOf,
  playedBy,
  registries,
} from './lib/stubs';
import AvailableTradeRateRegistry from '@civ-clone/core-trade-rate/AvailableTradeRateRegistry';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
import { Monarchy } from '@civ-clone/civ2-government/Governments';
import PlayerTradeRates from '@civ-clone/core-trade-rate/PlayerTradeRates';
import PlayerTradeRatesRegistry from '@civ-clone/core-trade-rate/PlayerTradeRatesRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import civ2CityCorruption from '@civ-clone/civ2-city/Rules/City/corruption';
import civ2CityGrow from '@civ-clone/civ2-city/Rules/City/grow';
import civ2CityYield from '@civ-clone/civ2-city/Rules/City/yield';
import civ2TradeRateYield from '@civ-clone/civ2-trade-rate/Rules/City/yield';
import { expect } from 'chai';
import grow from '../Rules/City/grow';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import yieldModifiers from '../Rules/City/yield-modifier';
import yieldRules from '../Rules/City/yield';

// These run this package's rules beside the real civ2-city and civ2-trade-rate rules they depend on the order of.

describe('with civ2-city and civ2-trade-rate', (): void => {
  it("a Courthouse halves civ2-city's corruption before civ2-trade-rate splits the trade, so gold and science rise", (): void => {
    const run = (courthouse: boolean) => {
      const r = registries(),
        ruleRegistry = new RuleRegistry(),
        capitalTile = { distanceFrom: () => 16 },
        capital = cityOf('p', { tile: () => capitalTile }),
        square = { id: () => 'square', yields: () => [new Trade(20)] },
        city: City = cityOf('p', {
          _ruleRegistry: ruleRegistry,
          tile: () => ({ distanceFrom: () => 16 }),
          tilesWorked: () => ({ entries: () => [square] }),
        }),
        availableTradeRates = new AvailableTradeRateRegistry(),
        playerTradeRates = new PlayerTradeRatesRegistry();

      availableTradeRates.register(Tax, Luxuries, ResearchRate);
      playerTradeRates.register(
        new PlayerTradeRates(
          'p' as any,
          new Tax(50),
          new Luxuries(0),
          new ResearchRate(50)
        )
      );
      r.cityImprovementRegistry.register(built(Palace, capital));

      if (courthouse) {
        r.cityImprovementRegistry.register(built(Courthouse, city));
      }

      ruleRegistry.register(
        ...civ2CityYield(
          r.cityImprovementRegistry,
          governedBy(Monarchy),
          { getByCity: () => [] } as any,
          atLevel(3),
          playedBy()
        ).filter((rule) => rule.id() === 'civ2-city:city/yield/worked-tiles'),
        // civ2-city's corruption, 16 squares from the Palace.
        ...civ2CityCorruption({
          clientRegistry: playedBy(),
          gameDifficultyRegistry: atLevel(3),
          pendingEffectRegistry: { getByTarget: () => [] } as any,
          playerGovernmentRegistry: governedBy(Monarchy),
          capitalLink: {
            capital: () => ({ distance: 16, nearest: capital }),
            has: (target: City, Improvement: any) =>
              r.cityImprovementRegistry
                .getByCity(target)
                .some((improvement) => improvement instanceof Improvement),
          } as any,
        }).filter((rule) => rule.id() === 'civ2-city:city/yield/corruption'),
        ...civ2TradeRateYield(availableTradeRates, playerTradeRates),
        ...yieldRules({ ...r, playerGovernmentRegistry: governedBy(Monarchy) }),
        ...yieldModifiers(r)
      );

      const yields = city.yields();

      return {
        corruption: -reduceYield(yields, Corruption),
        gold: reduceYield(yields, Gold),
        science: reduceYield(yields, Research),
      };
    };

    const without = run(false),
      withCourthouse = run(true);

    expect(without.corruption).greaterThan(1);
    expect(withCourthouse.corruption).equal(Math.floor(without.corruption / 2));
    expect(withCourthouse.gold + withCourthouse.science).equal(
      without.gold +
        without.science +
        (without.corruption - withCourthouse.corruption)
    );
  });

  it("a Granary keeps half a box after civ2-city's own Grow rules empty it, whichever registers first", (): void => {
    [true, false].forEach((oursFirst) => {
      const r = registries(),
        ruleRegistry = new RuleRegistry(),
        city = cityOf('p'),
        state = { stored: 30, size: 4 },
        cityGrowth = instanceOf(CityGrowth, {
          city: () => city,
          size: () => state.size,
          add: (y: any) => (state.stored += y.value()),
          empty: () => (state.stored = 0),
          setCost: () => undefined,
        }),
        theirs = civ2CityGrow().filter((rule) =>
          [
            'civ2-city:city/grow/empty-food-store',
            'civ2-city:city/grow/set-growth-cost',
          ].includes(rule.id())
        ),
        ours = grow(r);

      expect(theirs).length(2);
      r.cityImprovementRegistry.register(built(Granary, city));
      ruleRegistry.register(
        ...(oursFirst ? [...ours, ...theirs] : [...theirs, ...ours])
      );
      ruleRegistry.process(Grow, cityGrowth);

      expect(state.stored, oursFirst ? 'ours first' : 'theirs first').equal(25);
    });
  });
});
