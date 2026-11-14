import { Gold, Luxuries, Production, Research } from '../../Yields';
import { Registries, withDefaults } from '../../lib/source';
import { marketLevel, productionBonus, scienceBonus } from '../../lib/bonus';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Yield from '@civ-clone/core-yield/Yield';
import YieldModifier from '@civ-clone/core-city/Rules/YieldModifier';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';

// Civilization II's improvements add shares of the city's base yields, never of each other's (OpenCiv2 `city_split_trade`
//  and `city_calc_shields_pollution`, richardpenman/civ2@49f26ec; `lib/bonus`).
/** `compute` worked out once for each `base` array (one `yields()` call), for a rule's criterion and effect both. */
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

        return amount === 0 ? 0 : (amount * marketLevel(city, registries)) >> 1;
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
      provider: string
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
        )
      );

  return [
    ...([Luxuries, Gold] as (typeof Yield)[]).map((YieldType) =>
      modifier(
        `civ2-city-improvement:city/yield-modifier/market/${YieldType.name}`,
        market(YieldType),
        YieldType,
        'market'
      )
    ),
    modifier(
      'civ2-city-improvement:city/yield-modifier/science',
      science,
      Research,
      'science'
    ),
    modifier(
      'civ2-city-improvement:city/yield-modifier/production',
      production,
      Production,
      'factory'
    ),
  ];
};

export default getRules;
