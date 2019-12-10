import { decodeBody } from './body';
import { decodeLang } from './lang';
import { decodeLinks } from './links';
import { decodeTitle } from './title';
import { Result, Maybe } from 'true-myth';
import { DOMFromText, DOM } from '../dom';
import { Article } from '../article';

export function articleFromDOM(d: DOM): Result<Article, { reason: string }> {
  return instantiateArticle(d);
}

function instantiateArticle(dom: DOM): Result<Article, { reason: string }> {
  // TODO: make it more functional
  const lang = decodeLang(dom);
  const links = decodeLinks(dom);
  const title = decodeTitle(dom);
  const body = decodeBody(dom);

  if (lang.isJust() && links.isJust() && title.isJust() && body.isJust()) {
    return Result.ok({
      lang: lang.value,
      links: links.value,
      title: title.value,
      body: body.value
    });
  }
  return Result.err({ reason: 'Failed to decode' });
}
