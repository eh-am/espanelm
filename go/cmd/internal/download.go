package internal

import (
	"bilingual-articles/log"
	"context"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sync"
	"time"

	"golang.org/x/sync/errgroup"
)

// Download downloads a list of page into destPath
//func Download(pages []providers.Page, destPath string) error {
func Download(ctx context.Context, log log.Logger, links []string, destPath string) error {
	var wg sync.WaitGroup

	wg.Add(len(links))

	ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()

	g, ctx := errgroup.WithContext(ctx)

	// TODO timeout and whatnot
	for _, link := range links {
		link := link
		g.Go(func() error {
			log.Log("Downloading", link)
			// parse link to be able to access later
			parsed, err := url.Parse(link)
			if err != nil {
				return err
			}

			request, err := http.NewRequest("GET", link, nil)
			if err != nil {
				return err
			}

			dest := request.URL.Path
			resp, err := http.DefaultClient.Do(request)
			if err != nil {
				return err
			}

			// create directory if necessary
			path := path.Join(destPath, parsed.Host, dest)
			dir := filepath.Dir(path)
			if _, err := os.Stat(dir); os.IsNotExist(err) {
				err := os.MkdirAll(dir, 0755)
				if err != nil {
					return err
				}
			}

			f, err := os.Create(path)
			if err != nil {
				return err
			}
			defer f.Close()

			io.Copy(f, resp.Body)

			log.Log("Saved", link, "successfully")
			wg.Done()
			return nil
		})
	}

	wg.Wait()
	return nil
}
