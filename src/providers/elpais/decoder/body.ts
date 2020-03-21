import { DOM } from '../../../decoders/dom';
import { Maybe } from 'true-myth';

export function decodeBody(dom: DOM): Maybe<string[]> {
  return method1(dom).orElse(method2.bind(null, dom));
}

function method1(dom: DOM): Maybe<string[]> {
  return array(dom, '[itemprop="articleBody"] p');
}

function method2(dom: DOM): Maybe<string[]> {
  return array(dom, '.article_body p');
}

function array(dom: DOM, q: string): Maybe<string[]> {
  const body = Array.from(dom.querySelectorAll(q))
    .map(b => b.textContent || '')
    .filter(b => b.length > 1);

  if (body.length) {
    return Maybe.of(body);
  }
  return Maybe.nothing();
}
