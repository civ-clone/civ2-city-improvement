import { AvailableCityBuildItemsRegistry } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import improvements from './data/improvements';

/** Civilization II's 34 improvements, in @IMPROVE order, as a city's build list. */
export const register = (
  availableCityBuildItems: AvailableCityBuildItemsRegistry
): void =>
  availableCityBuildItems.register(
    ...improvements.map(
      ([Improvement]) => Improvement as unknown as typeof Buildable
    )
  );

export default register;
