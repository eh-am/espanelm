import scrapeRSS, { RSSResponse } from './scrapeRSS';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
const axiosMock = new MockAdapter(axios);
import { reduce } from 'rxjs/operators';
import { loadFixture } from '../../../test/helpers';

it('should work', async done => {
  await axiosMock.onGet('/').reply(200, loadFixture('portada_completo.xml'));

  scrapeRSS('/')
    .pipe(reduce((acc, cur) => [...acc, cur], [] as RSSResponse[]))
    .subscribe({
      next: a => {
        expect(a.length).toBe(45);

        done();
      }
    });
});

it('should work with spanish rss feed', async done => {
  await axiosMock.onGet('/').reply(200, loadFixture('portada_12_06_2019.xml'));

  scrapeRSS('/')
    .pipe(reduce((acc, cur) => [...acc, cur], [] as RSSResponse[]))
    .subscribe({
      next: a => {
        expect(a.length).toBe(20);

        done();
      }
    });
});
