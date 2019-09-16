import scrapePage from './scrapePage';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
const axiosMock = new MockAdapter(axios);

const fixture = fs.readFileSync(
  path.join(__dirname, '../fixtures/article.html'),
  'utf8',
);

const expected = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../fixtures/article.json'), 'utf8'),
);

describe('tesrt', () => {
  it('should work', done => {
    axiosMock.onGet('/').reply(200, fixture);

    scrapePage('/').subscribe(a => {
      expect(a).toMatchObject(expected);

      done();
    });
  });
});
