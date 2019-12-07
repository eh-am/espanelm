import * as path from 'path';
const fs = require('fs').promises;

export const loadFixture = (n: string): Promise<unknown> =>
  fs.readFile(path.join(__dirname, `./fixtures/${n}`), 'utf8');
