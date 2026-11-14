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
export const getRules = (dependencies: Registries = {}): YieldModifier[] => {
  const registries = withDefaults(dependencies);

  return [
    ...([Luxuries, Gold] as (typeof Yield)[]).map(
      (YieldType) =>
        new YieldModifier(
          `civ2-city-improvement:city/yield-modifier/market/${YieldType.name}`,
          new Low(),
          new Criterion(
            (city: City): boolean => marketLevel(city, registries) > 0
          ),
          new Effect(
            (city: City, yields: Yield[], base: Yield[]): Yield =>
              new YieldType(
                (Math.max(reduceYield(base, YieldType), 0) *
                  marketLevel(city, registries)) >>
                  1,
                'market'
              )
          )
        )
    ),

    new YieldModifier(
      'civ2-city-improvement:city/yield-modifier/science',
      new Low(),
      new Criterion(
        (city: City, yields: Yield[], base: Yield[]): boolean =>
          scienceBonus(
            city,
            Math.max(reduceYield(base, Research), 0),
            registries
          ) > 0
      ),
      new Effect(
        (city: City, yields: Yield[], base: Yield[]): Yield =>
          new Research(
            scienceBonus(
              city,
              Math.max(reduceYield(base, Research), 0),
              registries
            ),
            'science'
          )
      )
    ),

    new YieldModifier(
      'civ2-city-improvement:city/yield-modifier/production',
      new Low(),
      new Criterion(
        (city: City, yields: Yield[], base: Yield[]): boolean =>
          productionBonus(
            city,
            Math.max(reduceYield(base, Production), 0),
            registries
          ) > 0
      ),
      new Effect(
        (city: City, yields: Yield[], base: Yield[]): Yield =>
          new Production(
            productionBonus(
              city,
              Math.max(reduceYield(base, Production), 0),
              registries
            ),
            'factory'
          )
      )
    ),
  ];
};

export default getRules;
