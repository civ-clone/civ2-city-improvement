import { CityImprovement } from '@civ-clone/core-city-improvement/CityImprovement';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { FoodStorage } from '../../Yields';
import { Granary } from '../../CityImprovements';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
import { Pyramids } from '../../Wonders';
import { Registries, hasEither, withDefaults } from '../../lib/source';
import { granaryRowsPerCitizen } from '../../data/rules';
import { growthLimit } from '@civ-clone/base-city-growth-limit/lib/growthLimit';
import { growthLimits } from '../../lib/growthLimit';

// OpenCiv2 `src/auto/city.cpp` `city_process_food` (richardpenman/civ2@49f26ec), after civ2-city's own `Grow` rules
//  have emptied the box: a Granary (or the Pyramids) leaves half a box for the new size, at @COSMIC's rows, whoever's
//  city it is; then a city past a size cap (`lib/growthLimit`) shrinks back, keeping that box, as Civ2's undoes the
//  growth after filling it.
export const getRules = (registries: Registries = {}): Grow[] => {
  const { cityImprovementRegistry } = withDefaults(registries);

  return [
    new Grow(
      'civ2-city-improvement:city/grow/granary',
      new Criterion((cityGrowth: CityGrowth): boolean =>
        hasEither(cityGrowth.city(), Granary, Pyramids, registries)
      ),
      new Effect((cityGrowth: CityGrowth): void =>
        cityGrowth.add(
          new FoodStorage((cityGrowth.size() + 1) * granaryRowsPerCitizen)
        )
      )
    ),
    new Grow(
      'civ2-city-improvement:city/grow/size-limit',
      new Criterion((cityGrowth: CityGrowth): boolean => {
        const limit = growthLimit(
          cityGrowth,
          growthLimits,
          cityImprovementRegistry
        );

        return limit !== null && cityGrowth.size() > limit[0];
      }),
      new Effect((cityGrowth: CityGrowth): void => {
        const [, Needs] = growthLimit(
          cityGrowth,
          growthLimits,
          cityImprovementRegistry
        )!;

        cityGrowth.shrink(Needs as typeof CityImprovement);
      })
    ),
  ];
};

export default getRules;
