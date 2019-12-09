import { JSDOM } from 'jsdom';
import { DOM } from './dom';

export function decodeTitle(dom: DOM): string {
  // in fact there may be more than one in the DOM
  // so querySelector is just a very aggressive heuristic
  // (ie TODO query should be more specific)
  const title = dom.querySelector('[itemprop=headline]');
  const textContent = title && title.textContent;

  if (textContent) {
    return textContent;
  }

  // try method 2
  const method2 = dom.querySelector('meta[property="og:title"]') as any;

  if (method2 && method2.content) {
    return method2.content;
  }

  return '';
}
