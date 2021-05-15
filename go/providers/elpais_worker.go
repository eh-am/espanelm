package providers

import (
	"context"
	"errors"
	"log"
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
	FindBilingualPages(ctx context.Context, articleUrl string, published *time.Time) (*Page, error)

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

	log.Println("Fetching RSS")
	feed, err := elw.RSS(ctx)
	if err != nil {
		return nil, err
	}

	pages := elw.processRSS(ctx, feed)

	log.Println("num of pages", pages)
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
		log.Println("creating worker", i)
		go func() {
			for j := range pagesCh {
				log.Println("Sending page to be processed", j)
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
	log.Println("page size is", numPages)
	for i := 0; i < numPages; i++ {
		r := <-resultsCh

		log.Println("Received page", i)
		// only send results further if they are valid results
		if r.Error == nil {
			log.Println("Processed page", i, "with no error")
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

func (elw *ElPaisWorker) processRSS(ctx context.Context, feed *gofeed.Feed) []Page {
	numLinks := len(feed.Items)

	links := make(chan pageProcess, numLinks)
	resultsCh := make(chan result, numLinks)

	// create the workers
	// TODO errgroup
	for i := 0; i < elw.Workers; i++ {
		go elw.workerRSS(ctx, links, resultsCh)
	}

	// send the links to the buffered channel
	for _, item := range feed.Items {
		links <- pageProcess{published: feed.PublishedParsed, url: item.Link}
	}
	close(links)

	// get the response
	results := make([]Page, 0, numLinks)
	log.Println("numLinks", numLinks)
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

func (elw *ElPaisWorker) workerRSS(ctx context.Context, in <-chan pageProcess, results chan<- result) {
	for j := range in {
		page, err := elw.FindBilingualPages(ctx, j.url, j.published)

		if err != nil {
			log.Println("page errored", j.url)
			results <- result{Error: err}
			continue
		}

		if page == nil {
			log.Println("page has no bilingual page", j.url)
			results <- result{Error: errors.New("no bilingual page")}
			continue
		}

		log.Println("page does have bilingual page", j.url, page.Links)
		results <- result{Page: *page}
	}
}
