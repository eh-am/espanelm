package elpais

import (
	"context"
	"errors"
	"time"

	"bilingual-articles/log"
	"github.com/mmcdole/gofeed"
)

type ElPaisRunner struct {
	// Number of workers
	Workers int
	p       ElPaisProvider
	log.Logger
}

// ElPaisProvider refers to the inner provider
type ElPaisProvider interface {
	// RSS loads a rss feed
	RSS(ctx context.Context) (*gofeed.Feed, error)

	// Find pages that are bilingual
	FindBilingualPages(ctx context.Context, articleUrl string, published *time.Time) (*Page, error)

	// Process each individual page
	ProcessPage(ctx context.Context, page Page) (*ElPaisArticle, error)
}

func NewRunner(e ElPaisProvider, Logger log.Logger, workers int) *ElPaisRunner {
	if workers <= 0 {
		workers = 2
	}

	return &ElPaisRunner{workers, e, Logger}
}

// Run performs the whole song and dance with high performance using goroutines
//
// In a nutshell it will:
// 1. Hit the RSS feed
// 2. For every page fetched from the RSS feed,
//    check whether there's another version in a different language
// 3. For every "bilingual page",
//    download the original version + the alternate version
//    run readability.js to filter the important bits
// 4. Return a list of bilingual articles, with their contents
func (elw *ElPaisRunner) Run(ctx context.Context) ([]ElPaisArticle, error) {
	elw.Log("Fetching RSS")
	feed, err := elw.p.RSS(ctx)
	if err != nil {
		return nil, err
	}

	elw.Log("Processing RSS results", feed.Items)
	pages := elw.FindBilingualPages(ctx, feed)

	elw.Log("Found", len(pages), "bilingual pages")

	// TODO what about the errors?
	elpaisArticles := elw.processPage(ctx, pages)

	elw.Log("Processed", len(elpaisArticles), "pages successfully")

	return elpaisArticles, nil
}

// Process each individual page
// Ignoring any errors
func (elw *ElPaisRunner) processPage(ctx context.Context, pages []Page) []ElPaisArticle {
	type result struct {
		Article ElPaisArticle
		Error   error
	}

	numPages := len(pages)

	pagesCh := make(chan Page, numPages)
	resultsCh := make(chan result, numPages)

	// create the workers
	// TODO errgroup
	for i := 0; i < elw.Workers; i++ {
		go func() {
			for j := range pagesCh {
				article, err := elw.p.ProcessPage(ctx, j)
				if err != nil {
					resultsCh <- result{Error: err}
					continue
				}

				resultsCh <- result{Article: *article}
			}
		}()
	}

	// send the links to the buffered channel
	for _, page := range pages {
		pagesCh <- page
	}
	close(pagesCh)

	// get the response
	results := make([]ElPaisArticle, 0, numPages)
	for i := 0; i < numPages; i++ {
		r := <-resultsCh

		// only send results further if they are valid results
		if r.Error == nil {
			results = append(results, r.Article)
		}
	}
	return results
}

// TODO
// come up with a better name
type pageProcess struct {
	url       string
	published *time.Time
}

// FindBilingualPages run the provider's FindBilingualPages method
// in a high performance hashion
func (elw *ElPaisRunner) FindBilingualPages(ctx context.Context, feed *gofeed.Feed) []Page {
	type result struct {
		Page  Page
		Error error
	}
	numLinks := len(feed.Items)

	links := make(chan pageProcess, numLinks)
	resultsCh := make(chan result, numLinks)

	// create the workers
	// TODO errgroup
	for i := 0; i < elw.Workers; i++ {
		go func() {
			for j := range links {
				elw.Log("Trying to validate page", j.url, " as bilingual")
				page, err := elw.p.FindBilingualPages(ctx, j.url, j.published)

				if err != nil {
					elw.Log("Page errored", j.url)
					resultsCh <- result{Error: err}
					continue
				}

				if page == nil {
					elw.Log("Page is not bilingual", j.url)
					resultsCh <- result{Error: errors.New("no bilingual page")}
					continue
				}

				elw.Log("Page confirmed as bilingual", j.url)
				resultsCh <- result{Page: *page}
			}
		}()
	}

	// send the links to the buffered channel
	for _, item := range feed.Items {
		links <- pageProcess{published: feed.PublishedParsed, url: item.Link}
	}
	close(links)

	// get the response
	results := make([]Page, 0, numLinks)
	for i := 0; i < numLinks; i++ {
		r := <-resultsCh

		// only send results further if they are valid results
		if r.Error == nil {
			results = append(results, r.Page)
		}
	}
	return results
}
