import * as path from 'path';
const fs = require('fs').promises;

export const loadFixture = (n: string): Promise<string> =>
  fs.readFile(path.join(__dirname, `./fixtures/${n}`), 'utf8');

export const loadFixtureOrFail = (n: string): Promise<string> => {
  const fixture = loadFixture(n);
  if (!fixture) {
    throw new Error(`Could not load fixture: ${n}`);
  }

  return fixture;
};
