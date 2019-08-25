import axios from "axios";
import { JSDOM } from "jsdom";
import { map, filter, tap } from "rxjs/operators";
import { of, Observable, from } from "rxjs";
const UserAgent = require("user-agents");

export default function scrapePage(url: string) {
  return load(url).pipe(
    map(r => new JSDOM(r)),
    // tap(dom => {
    //   console.log("extract links", extractLinks(dom));
    // }),
    filter(dom => extractLinks(dom).length > 0),
    map(dom => {
      const textContentOrEmpty = (e: Element | null) => {
        if (e && e.textContent) {
          return e.textContent;
        }

        return "";
      };

      const getDatePublished = () => {
        const a = dom.window.document.querySelector(
          '[itemprop="datePublished"]'
        );
        if (!a) {
          return "";
        }
        const date = a.getAttribute("content");
        if (date) {
          return new Date(date);
        }

        return "";
      };

      const getLang = () => {
        const meta = dom.window.document.querySelector('meta[name="lang"]');
        if (meta && meta.getAttribute("content")) {
          return meta.getAttribute("content");
        }
        return "";
      };

      return {
        // rely on https://schema.org/ definitions
        datePublished: getDatePublished(),
        lang: getLang(),
        links: extractLinks(dom),
        title: textContentOrEmpty(
          dom.window.document.querySelector("[itemprop=headline]")
        ),
        body: Array.from(
          dom.window.document.querySelectorAll('[itemprop="articleBody"] p')
        )
          .filter(hasTextContent)
          .map(a => a.textContent)
      };
    })
  );
}

/**
 * Links
 *
 */
function extractLinks(dom: JSDOM) {
  return filterLinks(
    Array.from(dom.window.document.querySelectorAll('link[rel="alternate"]'))
  );
}

function filterLinks(
  elements: Element[]
): Pick<HTMLLinkElement, "href" | "hreflang">[] {
  return elements.filter(isHTMLLink).map(a => ({
    href: a.href,
    hreflang: a.hreflang
  }));
}

function isHTMLLink(e: Element): e is HTMLLinkElement {
  const asHTMLLink = e as HTMLLinkElement;

  if (asHTMLLink.href && asHTMLLink.hreflang) {
    return true;
  } else {
    return false;
  }
}

function hasTextContent(e: Element) {
  if (e.textContent) {
    return e.textContent.length > 0;
  }
  return false;
}

function load(url: string): Observable<string> {
  return from(
    axios
      .get(url, {
        // a random user agent must be generated
        // so that we don't get banned
        headers: {
          "User-Agent": new UserAgent().toString()
        }
      })
      .then(r => r.data)
  );
}
