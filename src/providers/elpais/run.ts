import scrapePage from './scrapePage';
import scrapeRSS from './scrapeRSS';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { Observable, of, EMPTY } from 'rxjs';
import { Languages } from '../../languages';

// we need to infer the type later
type Unpack<T> = T extends Observable<infer U> ? U : never;
type Article = Unpack<ReturnType<typeof scrapePage>>;

export function run(url: string): Observable<any> {
  return scrapeRSS(url).pipe(
    mergeMap((rssItem) => {
      // Scrape the original language
      return scrapePage(rssItem.link).pipe(
        // Guarantee the page has a link to the target language
        mergeMap((b) => {
          return b.links[rssItem.language.target] ? of(b) : EMPTY;
        }),

        // Scrape the target language page
        mergeMap((originalPage) => {
          const targetLang = rssItem.language.target;
          return scrapePage(originalPage.links[targetLang]).pipe(
            map((targetPage) => {
              switch (rssItem.language.origin) {
                case Languages.SPANISH: {
                  return {
                    es: originalPage,
                    ptbr: targetPage,
                  };
                }

                case Languages.PORTUGUESE: {
                  return {
                    ptbr: originalPage,
                    es: targetPage,
                  };
                }
              }
            })
          );
        }),
        map((b) => {
          const r = rssItem as any;
          return {
            ...b,
            publishedAt: rssItem.isoDate
              ? new Date(rssItem.isoDate).getTime() / 1000
              : null,

            // https://github.com/rbren/rss-parser/issues/130
            image:
              r['media:thumbnail']?.['media:thumbnail']?.[0]?.['$']?.['url'],
          };
        })
      );
    }),

    // filter out articles with 0 paragraphs (wtf?)
    mergeMap((a) => {
      if (a.es.body.length && a.ptbr.body.length) {
        return of(a);
      }

      console.warn('Article has 0 paragraphs. Skipping...', a);
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
    es,
  };
}
