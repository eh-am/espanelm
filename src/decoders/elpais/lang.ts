import { DOM } from '../dom';
import { Maybe } from 'true-myth';

export function decodeLang(dom: DOM): Maybe<string> {
  const meta = dom.querySelector('meta[name="lang"]');
  const content = meta && meta.getAttribute('content');
  // TODO: validate lang is supported
  if (content) {
    return Maybe.just(content);
  }

  return Maybe.nothing();
}
