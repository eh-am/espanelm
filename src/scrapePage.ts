import { JSDOM } from 'jsdom';
import { map, switchMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { load } from './utils';

export function scrapePage(
  url: string
): Observable<{
  lang: string;
  links: { ptbr: string; es: string };
  title: string;
  body: string[];
}> {
  return load<string>(url).pipe(
    map(r => new JSDOM(r)),
    map(dom => {
      return {
        // rely on https://schema.org/ definitions
        lang: extractLang(dom),
        links: extractLinks(dom),
        title: extractTitle(dom),
        body: extractBody(dom)
      };
    }),
    switchMap(a => {
      // TODO:
      // validate
      if (!a.links.es || !a.links.ptbr) {
        return EMPTY;
      }

      return of(a);
    })
  );
}

function extractLang(dom: JSDOM): string {
  const meta = dom.window.document.querySelector('meta[name="lang"]');
  const content = meta && meta.getAttribute('content');

  return content || '';
}

function extractTitle(dom: JSDOM): string {
  // in fact there may be more than one in the DOM
  // so querySelector is just a very aggressive heuristic
  // (ie TODO query should be more specific)
  const title = dom.window.document.querySelector('[itemprop=headline]');
  const textContent = title && title.textContent;

  return textContent || '';
}

function extractBody(dom: JSDOM): string[] {
  const extractContent = (a: Element[]): string[] =>
    a.map(b => b.textContent || '');

  const method1 = Array.from(
    dom.window.document.querySelectorAll('[itemprop="articleBody"] p')
  );
  if (method1.length > 0) {
    return extractContent(method1);
  }

  const method2 = Array.from(
    dom.window.document.querySelectorAll('.article_body p')
  );

  if (method2) return extractContent(method2);

  return [];
}

function extractLinks(dom: JSDOM): { ptbr: string; es: string } {
  const links = Array.from(
    dom.window.document.querySelectorAll('link[rel="alternate"]')
  );

  return {
    ptbr: filterLinks(links, 'pt-br') || filterLinks(links, 'pt-BR'),
    es: filterLinks(links, 'es') || filterLinks(links, 'es-ES')
  };
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

export default scrapePage;
