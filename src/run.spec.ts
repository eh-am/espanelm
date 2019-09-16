import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
const axiosMock = new MockAdapter(axios);
import { default as articlesList } from '../fixtures/articles/list';

import { run } from './run';

const fixture = fs.readFileSync(
  path.join(__dirname, '../fixtures/portada_completo.xml'),
  'utf8'
);

const articles = articlesList.map(a => {
  return {
    url: a.url,
    content: fs.readFileSync(
      path.join(__dirname, `../fixtures/articles/${a.name}`),
      'utf8'
    )
  };
});

describe('tesrt', () => {
  it('should work', async done => {
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
});
