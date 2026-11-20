import { Gold, Luxuries, Production, Research } from '../../Yields';
import { Registries, withDefaults } from '../../lib/source';
import {
  Source,
  factorySources,
  marketLevel,
  marketSources,
  plantSources,
  productionBonus,
  scienceBonus,
  scienceSources,
} from '../../lib/bonus';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Description, {
  EffectDescription,
} from '@civ-clone/core-rule/Description';
import { IsaacNewtonsCollege } from '../../Wonders';
import { cityBonusShift, plantQuarters } from '../../data/rules';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

// Civilization II's improvements add shares of the city's base yields, never of each other's (OpenCiv2 `city_split_trade`
//  and `city_calc_shields_pollution`, richardpenman/civ2@49f26ec; `lib/bonus`).
/** `compute` worked out once for each `base` array (one `yields()` call), for a rule's criterion and effect both. */
/** The share of the base each Marketplace, Bank, Stock Exchange, Library, University and Research Lab adds. */
const cityBonusShare = 1 / (1 << cityBonusShift);

/** What each source adds (`yield_percent` of the base), and its Wonder's `acts_as` for its owner's cities. */
const describe = (
  sources: Source[],
  YieldType: typeof Yield,
  value: (Improvement: Source[0]) => number,
  clauses: (Improvement: Source[0]) => object = () => ({})
): EffectDescription[] =>
  sources.flatMap(([Improvement, WonderType]): EffectDescription[] => [
    {
      type: 'yield_percent',
      subject: Improvement,
      yield: YieldType,
      value: value(Improvement),
      of: 'base',
      ...clauses(Improvement),
    },
    ...(WonderType === null
      ? []
      : [
          {
            type: 'acts_as',
            subject: WonderType,
            improvement: Improvement,
            scope: 'player',
          },
        ]),
  ]);

const oncePerBase = (compute: (city: City, base: Yield[]) => number) => {
  const known = new WeakMap<Yield[], number>();

  return (city: City, base: Yield[]): number => {
    if (!known.has(base)) {
      known.set(base, compute(city, base));
    }

    return known.get(base)!;
  };
};

export const getRules = (dependencies: Registries = {}): YieldModifier[] => {
  const registries = withDefaults(dependencies),
    market = (YieldType: typeof Yield) =>
      oncePerBase((city: City, base: Yield[]): number => {
        const amount = Math.max(reduceYield(base, YieldType), 0);

        return amount === 0
          ? 0
          : (amount * marketLevel(city, registries)) >> cityBonusShift;
      }),
    science = oncePerBase((city: City, base: Yield[]): number => {
      const amount = Math.max(reduceYield(base, Research), 0);

      return amount === 0 ? 0 : scienceBonus(city, amount, registries);
    }),
    production = oncePerBase((city: City, base: Yield[]): number =>
      productionBonus(
        city,
        Math.max(reduceYield(base, Production), 0),
        registries
      )
    ),
    modifier = (
      id: string,
      bonus: (city: City, base: Yield[]) => number,
      YieldType: typeof Yield,
      provider: string,
      description: Description
    ): YieldModifier =>
      new YieldModifier(
        id,
        new Low(),
        new Criterion(
          (city: City, yields: Yield[], base: Yield[]): boolean =>
            bonus(city, base) > 0
        ),
        new Effect(
          (city: City, yields: Yield[], base: Yield[]): Yield =>
            new YieldType(bonus(city, base), provider)
        ),
        description
      );

  return [
    ...([Luxuries, Gold] as (typeof Yield)[]).map((YieldType) =>
      modifier(
        `civ2-city-improvement:city/yield-modifier/market/${YieldType.name}`,
        market(YieldType),
        YieldType,
        'market',
        new Description(
          ...describe(marketSources, YieldType, () => cityBonusShare)
        )
      )
    ),
    modifier(
      'civ2-city-improvement:city/yield-modifier/science',
      science,
      Research,
      'science',
      new Description(
        ...describe(scienceSources, Research, () => cityBonusShare),
        // Isaac Newton's leaves its own city's bonus whole: another half for each of them.
        {
          type: 'yield_percent',
          subject: IsaacNewtonsCollege,
          yield: Research,
          value: cityBonusShare,
          of: 'base',
          per: scienceSources.map(([Improvement]) => Improvement),
        }
      )
    ),
    modifier(
      'civ2-city-improvement:city/yield-modifier/production',
      production,
      Production,
      'factory',
      new Description(
        ...describe(
          factorySources.map(([Improvement]): Source => [Improvement, null]),
          Production,
          (Improvement) =>
            factorySources.find(([Factory]) => Factory === Improvement)![1] / 4
        ),
        // A plant adds as much as the factories, up to its own share, so it needs one of them.
        ...describe(
          plantSources,
          Production,
          () => plantQuarters / 4,
          (Plant) => ({
            needs: factorySources.map(([Improvement]) => Improvement),
            notWith: plantSources
              .map(([Improvement]) => Improvement)
              .filter((Other) => Other !== Plant),
          })
        )
      )
    ),
  ];
};

export default getRules;
