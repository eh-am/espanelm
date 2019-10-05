import scrapePage from './scrapePage';
import scrapeRSS from './scrapeRSS';
import { map, mergeMap, reduce, tap } from 'rxjs/operators';
import { Observable, of, EMPTY } from 'rxjs';

// we need to infer the type later
type Unpack<T> = T extends Observable<infer U> ? U : never;
type Article = Unpack<ReturnType<typeof scrapePage>>;

export function run(url: string): Observable<any> {
  return scrapeRSS(url).pipe(
    mergeMap(a =>
      scrapePage(a.link).pipe(
        mergeMap(a => (a.links.es ? of(a) : EMPTY)),
        mergeMap(ptbr => {
          // scrape es
          return scrapePage(ptbr.links.es).pipe(
            map(es => {
              return {
                ptbr,
                es
              };
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
    mergeMap(a => (a.es.body.length && a.ptbr.body.length ? of(a) : EMPTY)),

    // we are only interested in the last values
    reduce((prev, curr) => [...prev, curr], [] as ReturnType<
      typeof mountObject
    >[])
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
