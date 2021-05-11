package main

import (
	"bilingual-articles/providers"
	"context"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

// Given a rss field
// Download all articles
// Used specially for testing
// RUN FROM ROOT OTHERWISE TESTDATA PATH WILL BE MESSED UP

func main() {
	elpais := providers.Elpais{
		RssGetter: &providers.RSSGet{},
	}
	feed, err := elpais.RSS(context.TODO())
	if err != nil {
		panic(err)
	}

	// TODO timeout and whatnot
	for _, item := range feed.Items {
		request, err := http.NewRequest("GET", item.Link, nil)
		if err != nil {
			panic(err)
		}

		dest := request.URL.Path
		resp, err := http.DefaultClient.Do(request)
		if err != nil {
			panic(err)
		}

		// create directory if necessary
		path := "testdata" + dest
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
	}

}
