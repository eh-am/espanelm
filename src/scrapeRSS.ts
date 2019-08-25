let Parser = require("rss-parser");
let parser = new Parser();
import { from, Observable, of } from "rxjs";
const path = require("path");
const fs = require("fs");

// const rssData = path.join(__dirname, "../../fixtures/rss.json");

// /{ creator: 'Rocío Montes',
// title:
//  '“É indispensável uma voz latino-americana contra a mudança climática”',
// link:
//  'https://elpais.com/brasil/2019/08/19/internacional/1566238835_948550.html#?ref=rss&format=simple&link=link',
// pubDate: 'Sat, 24 Aug 2019 15:25:45 +0200',
// enclosure:
//  { url:
//     'http://elpais.com/internacional/imagenes/2019/08/19/america/1566238835_948550_1566239423_miniatura_normal.jpg',
//    length: '25',
//    type: 'image/jpeg' },
// 'dc:creator': 'Rocío Montes',
// content:
//  'O ex-presidente socialista chileno (2000-2006) alerta que o combate à mudança climática não pode ficar apenas nas mãos dos EUA e da China.',
// contentSnippet:
//  'O ex-presidente socialista chileno (2000-2006) alerta que o combate à mudança climática não pode ficar apenas nas mãos dos EUA e da China.',
// guid:
//  'https://elpais.com/brasil/2019/08/19/internacional/1566238835_948550.html#?ref=rss&format=simple&link=guid',
// isoDate: '2019-08-24T13:25:45.000Z' },
// interface
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
  const rssData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../fixtures/rss.json"), {
      encoding: "utf-8"
    })
  ) as RSSResponse[];
  //   let rssData = rssData as RSSResponse[];

  return from(rssData);
  //   return from(
  //     (parser.parseURL(url) as Promise<RSSResponse[]>).then(
  //       (feed: any) => feed.items
  //     )
  //   );
}
