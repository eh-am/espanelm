import scrapePage from "./scrapePage";
import scrapeRSS from "./scrapeRSS";
import { map, mergeMap, delay, tap, filter } from "rxjs/operators";
import { of } from "rxjs";
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID
  }
});

let data: any = [];

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

function uploadToS3(data: any) {
  s3.putObject(
    {
      Bucket: "espanelm",
      Key: "news.json",
      Body: JSON.stringify(data)
    },
    function() {
      console.log("Successfully uploaded package.");
    }
  );
}
