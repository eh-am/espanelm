import RSSParser from 'rss-parser';
const rssParser = new RSSParser();
import { from, Observable, of, EMPTY } from 'rxjs';
import { switchMap, pluck, mergeMap } from 'rxjs/operators';
import { load } from './utils';

// make 'link' field required
export type RSSResponse = RSSParser.Item &
  Required<Pick<RSSParser.Item, 'link'>>;

export default function scrapeRSS(url: string): Observable<RSSResponse> {
  return load<string>(url).pipe(
    switchMap(a => rssParser.parseString(a)),
    pluck('items'),
    switchMap(a => (a ? from(a) : EMPTY)), // sends one item at a time
    mergeMap(a => (isRSSResponseWithLink(a) ? of(a) : EMPTY)) // filter only those with .link field
  );
}

function isRSSResponseWithLink(item: RSSParser.Item): item is RSSResponse {
  return !!item.link;
}
