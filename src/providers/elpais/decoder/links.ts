import { DOM } from '../../../decoders/dom';
import { Maybe } from 'true-myth';

export interface PageLinks {
  ptbr: string;
  es: string;
}

export function decodeLinks(dom: DOM): Maybe<PageLinks> {
  // TODO: make it more functional

  const links = Array.from(dom.querySelectorAll('link[rel="alternate"]'));

  const extracted = {
    ptbr: filterLinks(links, 'pt-br') || filterLinks(links, 'pt-BR'),
    es: filterLinks(links, 'es') || filterLinks(links, 'es-ES')
  };

  if (extracted.ptbr && extracted.es) {
    return Maybe.just(extracted);
  }
  return Maybe.nothing();
}

function filterLinks(elements: Element[], lang: string): string {
  const el = elements.filter(isHTMLLink).find(a => a.hreflang === lang);

  if (el) {
    return el.href;
  }

  return '';
}

function isHTMLLink(e: Element): e is HTMLLinkElement {
  const asHTMLLink = e as HTMLLinkElement;

  if (asHTMLLink.href && asHTMLLink.hreflang) {
    return true;
  } else {
    return false;
  }
}
