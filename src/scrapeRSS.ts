let Parser = require("rss-parser");
let parser = new Parser();
import { from, Observable, of } from "rxjs";
import { filter, flatMap } from "rxjs/operators";

interface RSSResponse {
  title: string;
  link: string;
  pubDate: string; // TODO: use date
  enclosure: {
    url: string;
    length: string;
    type: "image/jpeg"; // TODO: mime type
  };
  content: string;
  guid: string;
  isoDate: string;
}

export default function scrapeRSS(url: string): Observable<RSSResponse> {
  return from(
    (parser.parseURL(url) as Promise<RSSResponse[]>).then(
      (feed: any) => feed.items
    )
  ).pipe(
    // break the array into single item at a time
    flatMap((a: RSSResponse[]) => a),
    filter(a => !!a.link)
  );
}
