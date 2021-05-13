package main

import (
	"bilingual-articles/providers"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sync"
)

// downloads all bilingual articles
func main() {
	elpais := providers.NewElPais(
		&providers.RSSGet{},
		&http.Client{},
		providers.Config{},
	)
	pages, err := elpais.FetchPagesList()
	if err != nil {
		panic(err)
	}

	var wg sync.WaitGroup

	// TODO timeout and whatnot
	for _, page := range pages {
		// let's do one page at a time
		wg.Add(len(page.Links))
		for _, link := range page.Links {
			go func(link providers.Link) {
				// parse link to be able to access later
				parsed, err := url.Parse(link.Url)
				if err != nil {
					panic(err)
				}

				request, err := http.NewRequest("GET", link.Url, nil)
				if err != nil {
					panic(err)
				}

				dest := request.URL.Path
				resp, err := http.DefaultClient.Do(request)
				if err != nil {
					panic(err)
				}

				// create directory if necessary
				path := path.Join("testdata", parsed.Host, dest)
				dir := filepath.Dir(path)
				if _, err := os.Stat(dir); os.IsNotExist(err) {
					err := os.MkdirAll(dir, 0755)
					if err != nil {
						panic(err)
					}
				}

				log.Println("Writing", path)
				f, err := os.Create(path)
				if err != nil {
					panic(err)
				}
				defer f.Close()

				io.Copy(f, resp.Body)

				wg.Done()
			}(link)
		}
		wg.Wait()
	}

}
