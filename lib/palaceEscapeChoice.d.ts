import { CapitalDependencies } from './capital';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
declare global {
  interface ChoiceMetaDataMap {
    'capture-city.palace-escape': boolean;
  }
}
/** What the person is asked about: the city the Palace would move to, and what it costs. */
export type PalaceEscapeQuestion = {
  city: City;
  cost: number;
};
/**
 * Hands a promise to civ2-city's plunder, so plunder waits for it, as `city_capture_aftermath` (~5462–5475) pays for the
 *  escape before it takes the plunder (capped to the gold left). civ2-city's `lib/captureAftermath` exports
 *  `waitBeforePlunder(city, pending)` for this; until it does, plunder doesn't wait, and the escape is paid for from
 *  what plunder left.
 */
export declare const civ2CityWaitBeforePlunder: (
  city: City,
  pending: Promise<unknown>
) => void;
export interface PalaceEscapeChoiceDependencies extends CapitalDependencies {
  clientRegistry?: ClientRegistry;
  /** Makes the capture's plunder wait for the answer: civ2-city's, by default. */
  waitBeforePlunder?: (city: City, pending: Promise<unknown>) => void;
}
/**
 * Civ2 asks a person whose capital was just taken, then and there, whether to pay 1000 gold to move the Palace to
 *  `escape` (`city_capture_aftermath_palace_escape` ~4790, `popup_game_with_sprite(str_canescape_2)`): their client is
 *  asked (`capture-city.palace-escape`, yes or no, with the city and the cost), and on yes the Palace is built there and
 *  paid for. The capture's plunder waits for the answer (`waitBeforePlunder`).
 */
export declare const askPalaceEscape: (
  captured: City,
  loser: Player,
  escape: City,
  dependencies?: PalaceEscapeChoiceDependencies
) => Promise<boolean>;
export default askPalaceEscape;
