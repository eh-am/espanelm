import { JSDOM } from 'jsdom';
import { map, switchMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { load } from './utils';

export function scrapePage(
  url: string
): Observable<{
  datePublished: number;
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
        datePublished: extractDate(dom),
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
  const title = dom.window.document.querySelector('[itemprop=headline]');
  const textContent = title && title.textContent;

  return textContent || '';
}

function extractBody(dom: JSDOM): string[] {
  const body = Array.from(
    dom.window.document.querySelectorAll('[itemprop="articleBody"] p')
  );

  return body.map(a => a.textContent || '');
}

function extractDate(dom: JSDOM): number {
  const a = dom.window.document.querySelector('[itemprop="datePublished"]');
  const date = a && a.getAttribute('content');

  if (date) {
    // TODO: verify this conversion
    // the idea is using posix time
    return new Date(date).getTime() / 1000;
  }
  return 0;
}

function extractLinks(dom: JSDOM): { ptbr: string; es: string } {
  const links = Array.from(
    dom.window.document.querySelectorAll('link[rel="alternate"]')
  );

  return {
    ptbr: filterLinks(links, 'pt-br'),
    es: filterLinks(links, 'es')
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
