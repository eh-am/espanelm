import { JSDOM } from 'jsdom';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { load } from '../../utils';
import { articleFromDOM } from './decoder';
import { JSDOMImpl } from '../../decoders/dom';
import { Article } from '../../decoders/article';

export function scrapePage(url: string): Observable<Article> {
  return load<string>(url).pipe(
    map(r => new JSDOMImpl(r)),
    map(dom => articleFromDOM(dom)),
    switchMap(a => {
      if (a.isOk()) {
        return of(a.value);
      }

      //      console.warn(
      //        'Skipping url since it could not be decoded into a valid article:',
      //        url
      //      );
      return EMPTY;
    }),
    catchError(() => {
      console.warn('Error parsing url', url);
      return EMPTY;
    })
  );
}

export default scrapePage;
