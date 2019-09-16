import { from, Observable, of, EMPTY } from 'rxjs';
import axios from 'axios';

// eslint-disable-next-line
const UserAgent = require('user-agents');

export function load<T>(url: string): Observable<T> {
  // console.log('requesting to', url);
  return from(
    axios
      .get(url, {
        // a random user agent must be generated
        // so that we don't get banned
        headers: {
          'User-Agent': new UserAgent().toString()
        }
      })
      .then(r => r.data)
  );
}
