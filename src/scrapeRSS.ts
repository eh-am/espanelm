import RSSParser from 'rss-parser';
const rssParser = new RSSParser();
import { from, Observable, of, EMPTY } from 'rxjs';
import { switchMap, pluck, mergeMap, tap } from 'rxjs/operators';
import { load } from './utils';

// make 'link' field required
export type RSSResponse = RSSParser.Item &
  Required<Pick<RSSParser.Item, 'link'>> & { language: 'ptbr' | 'es' };

export default function scrapeRSS(url: string): Observable<RSSResponse> {
  let language = '';

  return load<string>(url).pipe(
    switchMap(a => rssParser.parseString(a)),
    tap(a => {
      // TODO
      // narrow down the type here
      switch ((a as any).language) {
        case 'pt-br': {
          language = 'ptbr';
          break;
        }
        case 'es': {
          language = 'es';
          break;
        }

        default: {
          throw new Error(`Language not supported ${(a as any).language}`);
        }
      }
    }),
    pluck('items'),
    switchMap(a => (a ? from(a) : EMPTY)), // sends one item at a time
    mergeMap(a => (isRSSResponseWithLink(a) ? of({ language, ...a }) : EMPTY)) // filter only those with .link field
  );
}

function isRSSResponseWithLink(item: RSSParser.Item): item is RSSResponse {
  return !!item.link;
}
