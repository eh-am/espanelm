import scrapePage from "./scrapePage";
import scrapeRSS from "./scrapeRSS";
import { map, mergeMap, delay } from "rxjs/operators";
import { of } from "rxjs";
import { uploadToS3 } from "./s3";

const data: any = [];

scrapeRSS("https://brasil.elpais.com/rss/brasil/portada_completo.xml")
  .pipe(
    // artifially add a delay
    // to not raise any flags to the server
    delay(60000),
    mergeMap(a => scrapePage(a.link)),
    delay(60000),
    mergeMap(a => {
      const esLink = a.links.find(a => a.hreflang === "es");
      if (esLink) {
        return scrapePage(esLink.href).pipe(
          map(r => ({
            ptbr: a,
            es: r
          }))
        );
      }
      return of({});
    })
  )

  .subscribe(
    r => {
      data.push(r);
    },
    console.error,
    () => {
      // when the observable finishes
      // output everything at once
      uploadToS3(data);
    }
  );
