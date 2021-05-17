import { readFileSync } from 'fs';

export function loadPages() {
  let articlesPath = '';
  switch (process.env.NODE_ENV) {
    default: {
      articlesPath = '../data/elpais.json';
    }
  }

  // TODO
  // validate with zod
  const res = JSON.parse(readFileSync(articlesPath, 'utf8'));
  return res;
}
