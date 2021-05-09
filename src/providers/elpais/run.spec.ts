//
// the way this test works is by storing a complete
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
const axiosMock = new MockAdapter(axios);
import { default as articlesListPtBr } from '../../../test/fixtures/articles/list';
import { default as articlesListEs } from '../../../test/fixtures/articles_es/list';

import { run } from './run';
import { loadFixture } from '../../../test/helpers';

it('should work for ptbr rss', async done => {
  const fixture = await loadFixture('portada_completo.xml');
  const articles = await Promise.all(
    articlesListPtBr.map(a => ({
      url: a.url,
      content: loadFixture(`articles/${a.name}`)
    }))
  );

  articles.forEach(a => {
    axiosMock.onGet(a.url).reply(200, a.content);
  });

  axiosMock.onGet('/').reply(200, fixture);
  run('/').subscribe(
    a => {
      expect(a.length).toBe(18);
    },
    null,
    () => {
      done();
    }
  );
}, 30000);

it('should work for ptbr rss', async done => {
  const fixture = await loadFixture('portada_12_06_2019.xml');
  const articles = await Promise.all(
    articlesListEs.map(a => ({
      url: a.url,
      content: loadFixture(`articles_es/${a.name}`)
    }))
  );

  articles.forEach(a => {
    // TODO
    // find a better way to dela with these links
    axiosMock
      .onGet(a.url.replace('#?ref=rss&format=simple&link=link', ''))
      .reply(200, a.content);

    axiosMock.onGet(a.url).reply(200, a.content);
  });

  axiosMock.onGet('/').reply(200, fixture);
  run('/').subscribe(
    a => {
      expect(a.length).toBe(2);
    },
    null,
    () => {
      done();
    }
  );
}, 30000);
