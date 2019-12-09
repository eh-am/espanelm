import { DOM } from '../dom';
import { Maybe } from 'true-myth';

export function array<K>(dom: DOM, q: string): Maybe<K[]> {
  const body = Array.from(dom.querySelectorAll(q))
    .map(b => b.textContent || '')
    .filter(b => b.length > 1);

  if (body.length) {
    return Maybe.of(body);
  }
  return Maybe.nothing();
}
