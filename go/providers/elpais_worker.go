package providers

import (
	"context"
	"errors"
	"time"

	"github.com/mmcdole/gofeed"
)

type ElPaisWorker struct {
	// Number of workers running at the same time
	Workers int
	ElPaisProcessor
}

type ElPaisProcessor interface {
	// RSS loads a rss feed
	RSS(ctx context.Context) (*gofeed.Feed, error)

	// Find pages that are bilingual
	FindBilingualPages(ctx context.Context, articleUrl string) (*Page, error)

	// ProcessPage
	ProcessPage(ctx context.Context, page Page) (*ElPaisArticle, error)
}

func NewElPaisWorker(e ElPaisProcessor) *ElPaisWorker {
	// TODO figure out a good value
	return &ElPaisWorker{2, e}
}

func (elw *ElPaisWorker) Run() ([]ElPaisArticle, error) {
	// TODO cancel function
	ctx, cancelFunc := context.WithTimeout(context.Background(), time.Minute*5)

	_ = cancelFunc

	feed, err := elw.RSS(ctx)
	if err != nil {
		return nil, err
	}
	pages := elw.processRSS(ctx, feed)

	// TODO what about the errors?
	elpaisArticles := elw.processPage(ctx, pages)

	return elpaisArticles, nil
}

type elpaisArticleResult struct {
	Article ElPaisArticle
	Error   error
}

func (elw *ElPaisWorker) processPage(ctx context.Context, pages []Page) []ElPaisArticle {
	numPages := len(pages)

	pagesCh := make(chan Page, numPages)
	resultsCh := make(chan elpaisArticleResult, numPages)

	// create the workers
	// TODO errgroup
	for i := 0; i < elw.Workers; i++ {
		go func() {
			for j := range pagesCh {
				article, err := elw.ProcessPage(ctx, j)
				if err != nil {
					resultsCh <- elpaisArticleResult{Error: err}
					continue
				}

				resultsCh <- elpaisArticleResult{Article: *article}
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

func (elw *ElPaisWorker) processRSS(ctx context.Context, feed *gofeed.Feed) []Page {
	numLinks := len(feed.Links)

	links := make(chan string, numLinks)
	resultsCh := make(chan result, numLinks)

	// create the workers
	// TODO errgroup
	for i := 0; i < elw.Workers; i++ {
		go elw.workerRSS(ctx, links, resultsCh)
	}

	// send the links to the buffered channel
	for _, link := range feed.Links {
		links <- link
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

type result struct {
	Page  Page
	Error error
}

func (elw *ElPaisWorker) workerRSS(ctx context.Context, in <-chan string, results chan<- result) {
	for j := range in {
		page, err := elw.FindBilingualPages(ctx, j)
		if err != nil {
			results <- result{Error: err}
			continue
		}

		if page == nil {
			results <- result{Error: errors.New("no bilingual page")}
			continue
		}

		results <- result{Page: *page}
	}
}
