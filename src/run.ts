import scrapePage from './scrapePage';
import scrapeRSS from './scrapeRSS';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { Observable, of, EMPTY } from 'rxjs';

// we need to infer the type later
type Unpack<T> = T extends Observable<infer U> ? U : never;
type Article = Unpack<ReturnType<typeof scrapePage>>;

// not that pretty
// since rss returns us 'pt-br'
// but the scrapePage uses 'ptbr'
function opposite(a: 'es' | 'ptbr'): 'es' | 'ptbr' {
  switch (a) {
    case 'es':
      return 'ptbr';
    case 'ptbr':
      return 'es';
  }
}

export function run(url: string): Observable<any> {
  return scrapeRSS(url).pipe(
    mergeMap(a =>
      scrapePage(a.link).pipe(
        mergeMap(b => {
          const o = opposite(a.language);
          if (b.links[o]) {
            return of(b);
          }
          return EMPTY;
        }),
        mergeMap(page => {
          const key = opposite(a.language);
          // scrape es
          return scrapePage(page.links[key]).pipe(
            map(newPage => {
              switch (a.language) {
                case 'es': {
                  return {
                    es: page,
                    ptbr: newPage
                  };
                }

                case 'ptbr': {
                  return {
                    ptbr: page,
                    es: newPage
                  };
                }
              }
            })
          );
        }),
        map(b => {
          return {
            ...b,
            publishedAt: a.isoDate
              ? new Date(a.isoDate).getTime() / 1000
              : null,

            image: a.enclosure && a.enclosure.url ? a.enclosure.url : null
          };
        })
      )
    ),

    // filter out articles with 0 paragraphs (wtf?)
    mergeMap(a => {
      if (a.es.body.length && a.ptbr.body.length) {
        return of(a);
      }
      console.log('Article has 0 paragraphs. Skipping...', a);
      return EMPTY;
    }),

    // we are only interested in the last values
    reduce(
      (prev, curr) => [...prev, curr],
      [] as ReturnType<typeof mountObject>[]
    )
  );
}

function mountObject(
  ptbr: Article,
  es: Article
): {
  ptbr: Article;
  es: Article;
} {
  return {
    ptbr,
    es
  };
}
