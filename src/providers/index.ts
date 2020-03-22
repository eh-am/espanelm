import * as elpais from './elpais';
import { Observable } from 'rxjs';

export function run(string: 'elpais'): Observable<any> {
  // For Elpais we only support Pt to Es
  switch (string) {
    case 'elpais': {
      return elpais.run(
        'https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada'
      );
    }
  }
}
