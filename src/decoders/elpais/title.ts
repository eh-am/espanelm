import { DOM } from '../dom';
import { Maybe } from 'true-myth';

export function decodeTitle(dom: DOM): Maybe<string> {
  return decodeTitleMethod1(dom).orElse(decodeTitleMethod2.bind(null, dom));
}

function decodeTitleMethod1(dom: DOM): Maybe<string> {
  const title = dom.querySelector('[itemprop=headline]');
  const textContent = title && title.textContent;

  if (textContent) {
    return Maybe.just(textContent);
  }
  return Maybe.nothing();
}

function decodeTitleMethod2(dom: DOM): Maybe<string> {
  const method2 = dom.querySelector('meta[property="og:title"]') as any;

  if (method2 && method2.content) {
    return Maybe.just(method2.content);
  }
  return Maybe.nothing();
}
