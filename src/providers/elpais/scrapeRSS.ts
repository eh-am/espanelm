import RSSParser from 'rss-parser';
const rssParser = new RSSParser({
  customFields: {
    item: [['atom:link', 'media:thumbnail']]
  }
} as any);

import { from, Observable, of, EMPTY } from 'rxjs';
import { switchMap, mergeMap, map } from 'rxjs/operators';
import { Maybe } from 'true-myth';
import { load } from '../../utils';
import { ptbrToEs, esToPtBr, SupportedLanguages } from '../../languages';

// make 'link' field required
export type RSSResponse = RSSParser.Item &
  Required<Pick<RSSParser.Item, 'link'>> & { language: SupportedLanguages };

export default function scrapeRSS(url: string): Observable<RSSResponse> {
  return load<string>(url).pipe(
    // parse string into a RSSParser.Output type
    switchMap(rss => rssParser.parseString(rss)),

    // Validate it's a supported language
    map(rss => {
      const lang = normalizeLanguage(rss.language);
      if (lang.isNothing()) {
        throw new Error(`Language not supported ${lang}`);
      }

      return {
        ...rss,
        language: lang.value
      };
    }),

    // Add a language field to each RSS Item
    // So that each item can be analyzed individually
    map(rss => {
      if (rss.items) {
        return rss.items.map(a => ({ ...a, language: rss.language }));
      }
      throw new Error('There are no items in this RSS feed.');
    }),

    // sends one item at a time
    switchMap(rssItems => from(rssItems)),

    // assert the article we are passing is good to go
    mergeMap(a => (isValidRSSItem(a) ? of(a) : EMPTY))
  );
}

function isValidRSSItem(item: RSSParser.Item): item is RSSResponse {
  if (item.link && item.language) {
    return true;
  }
  return false;
}

// TODO: add types
function normalizeLanguage(language: string): Maybe<SupportedLanguages> {
  switch (language) {
    case 'pt-br': {
      return Maybe.just(ptbrToEs);
    }
    case 'es': {
      return Maybe.just(esToPtBr);
    }

    default: {
      return Maybe.nothing();
    }
  }
}
