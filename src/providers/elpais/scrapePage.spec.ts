import scrapePage from './scrapePage';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { loadFixture } from '../../../test/helpers';
const axiosMock = new MockAdapter(axios);

it('should work', async done => {
  const fixture = await loadFixture('article.html');
  const expected = JSON.parse((await loadFixture('article.json')) as string);

  axiosMock.onGet('/').reply(200, fixture);

  scrapePage('/').subscribe(a => {
    expect(a).toMatchObject(expected);

    done();
  });
});
