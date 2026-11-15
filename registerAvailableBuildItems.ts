import { AvailableCityBuildItemsRegistry } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import Capitalization from '@civ-clone/base-city-improvement-capitalization/Capitalization';
import improvements from './data/improvements';

/** Civilization II's 34 improvements, in @IMPROVE order, and Capitalization (row 38), as a city's build list. */
export const register = (
  availableCityBuildItems: AvailableCityBuildItemsRegistry
): void =>
  availableCityBuildItems.register(
    ...improvements.map(
      ([Improvement]) => Improvement as unknown as typeof Buildable
    ),
    Capitalization as unknown as typeof Buildable
  );

export default register;
