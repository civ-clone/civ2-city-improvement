import {
  readCivilize,
  readImprovements,
} from '@civ-clone/civ2-asset-extractor/rules';
import { advanceIndex } from '@civ-clone/civ2-science/lib/advanceIndex';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import { expect } from 'chai';
import improvements from '../data/improvements';
import { join } from 'path';
import { readCosmic } from '@civ-clone/civ2-asset-extractor/rules';
import { readFileSync } from 'fs';

// Compares the committed table with the player's own RULES.TXT. Skipped unless `CIV2_PATH` names the game's folder, so
//  CI, which has no copy of the game, never runs it. Only numbers are compared, and a failure names a row, never the
//  file's text.
const path = process.env.CIV2_PATH;

(path ? describe : describe.skip)('RULES.TXT @IMPROVE', (): void => {
  const text = path ? readFileSync(join(path, 'RULES.TXT'), 'latin1') : '',
    rows = path ? readImprovements(text) : [],
    // Prerequisites are written as the advances' built-in abbreviations, which the shipped file also writes as each
    //  @CIVILIZE row's comment: built here from the file, so nothing of it is committed.
    abbreviations = path
      ? readCivilize(text).map((row) => row.comment ?? '')
      : [],
    resolve = (token: string): number =>
      token === 'nil' ? -1 : abbreviations.indexOf(token);

  it('has the 34 buildable improvements in rows 1 to 34', (): void => {
    expect(improvements.length).equal(34);
    expect(rows.length >= 35).true;
  });

  it('matches the committed cost, upkeep and advance, row by row', (): void => {
    improvements.forEach(
      ([Improvement, cost, upkeep, Advance], index): void => {
        const row = rows[index + 1],
          at = `row ${index + 1} (${Improvement.name})`;

        expect(row.cost, `${at} cost`).equal(cost);
        expect(row.upkeep, `${at} upkeep`).equal(upkeep);
        expect(resolve(row.prerequisite), `${at} advance`).equal(
          Advance === null ? -1 : advanceIndex(Advance)
        );
      }
    );
  });

  it("matches @COSMIC's Aqueduct and Sewer sizes and rows", (): void => {
    const { effective } = readCosmic(text);

    expect(effective.aqueductSize).equal(cosmic.aqueductSize);
    expect(effective.sewerSize).equal(cosmic.sewerSize);
    expect(effective.foodBoxRows).equal(cosmic.foodBoxRows);
    expect(effective.shieldBoxRows).equal(cosmic.shieldBoxRows);
  });
});
