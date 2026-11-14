import { Game } from '@civ-clone/core-game';
import { expect } from 'chai';
import { join } from 'path';
import registerAdditionalData from '../registerAdditionalData';
import register from '../registerRules';

describe('register', (): void => {
  it("registers only civ2-city-improvement's rules, each with its own id, the 34 improvements and two data", (): void => {
    const game = new Game();

    register(game);
    registerAdditionalData(game);

    const ids = game.rules.entries().map((rule) => rule.id());

    expect(ids).not.empty;
    ids.forEach((id) => expect(id).match(/^civ2-city-improvement:/));
    expect(new Set(ids).size).equal(ids.length);
    expect(game.availableCityBuildItems.entries()).length(34);
    expect(game.additionalData.entries()).length(2);
  });

  it("uses the Palace civ2-city's corruption looks for", (): void => {
    const { Palace } = require('../CityImprovements'),
      fromCiv2City = require(require.resolve(
        '@civ-clone/base-city-improvement-palace/Palace',
        {
          paths: [
            join(require.resolve('@civ-clone/civ2-city/package.json'), '..'),
          ],
        }
      )).default;

    expect(Palace).equal(fromCiv2City);
  });

  it('loads no civ1-* or library-* module', (): void => {
    // The pattern catches one (a positive control), in either layout.
    [
      '/node_modules/@civ-clone/civ1-city/index.js',
      '/node_modules/.pnpm/@civ-clone+library-city@0.1.0/index.js',
    ].forEach(
      (path) => expect(/@civ-clone[\\/+](civ1|library)-/.test(path)).true
    );
    expect(Object.keys(require.cache).length).greaterThan(100);
    expect(
      Object.keys(require.cache).filter((path) =>
        /@civ-clone[\\/+](civ1|library)-/.test(path)
      )
    ).eql([]);
  });
});
