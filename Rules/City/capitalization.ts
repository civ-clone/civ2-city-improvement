import {
  capitalizationCost,
  capitalizationHold,
  capitalizationQueue,
} from '@civ-clone/base-city-improvement-capitalization/lib/capitalizationRules';
import BuildCost from '@civ-clone/core-city-build/Rules/BuildCost';
import BuildingHeld from '@civ-clone/core-city-build/Rules/BuildingHeld';
import Hold from '@civ-clone/core-city-build/Rules/Hold';

const options = { idPrefix: 'civ2-city-improvement' };

/**
 * Capitalization (base-city-improvement-capitalization), as OpenCiv2 has it (`src/auto/city_production.cpp`
 *  `city_process_production`, richardpenman/civ2@49f26ec): it costs nothing and never completes, and a city that builds
 *  it moves on to what's queued after it. Its conversion rule isn't registered: civ2-city's production step pays the
 *  turn's production out as gold instead of adding it to the build (`payOut`), so the shields in the box stay there,
 *  frozen, as `city_process_production` leaves them.
 */
export const getRules = (): (BuildCost | Hold | BuildingHeld)[] => [
  ...capitalizationCost(options),
  ...capitalizationHold(options),
  ...capitalizationQueue(options),
];

export default getRules;
