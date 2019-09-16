import scrapeRSS, { RSSResponse } from './scrapeRSS';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
const axiosMock = new MockAdapter(axios);
import { reduce } from 'rxjs/operators';

const fixture = fs.readFileSync(
  path.join(__dirname, '../fixtures/portada_completo.xml'),
  'utf8'
);

describe('tesrt', () => {
  it('should work', done => {
    axiosMock.onGet('/').reply(200, fixture);

    scrapeRSS('/')
      .pipe(reduce((acc, cur) => [...acc, cur], [] as RSSResponse[]))
      .subscribe({
        next: a => {
          expect(a.length).toBe(45);

          done();
        }
      });
  });
});
