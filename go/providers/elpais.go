package providers

import (
	"context"
	"net/http"
	"runtime"

	"github.com/PuerkitoBio/goquery"
	"github.com/mmcdole/gofeed"
)

type RssGetter interface {
	Get(context.Context, string) (*gofeed.Feed, error)
}

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type Elpais struct {
	RssGetter
	HttpClient

	Config
}

type Items []struct {
	gofeed.Item

	// TODO
	language string
}

type Config struct {
	MaxConcurrent int
}

func NewElPais(RssGetter RssGetter, HttpClient HttpClient, config Config) *Elpais {
	if config.MaxConcurrent == 0 {
		config.MaxConcurrent = runtime.GOMAXPROCS(0)
	}

	return &Elpais{
		RssGetter,
		HttpClient,
		config,
	}
}

//func (e *Elpais) ProcessPage(page Page) (interface{}, error) {
//	for _, link := range page.Links {
//		request, err := http.NewRequest("GET", link.Url, nil)
//		if err != nil {
//			return nil, err
//		}
//
//		res, err := e.HttpClient.Do(request)
//		if err != nil {
//			return nil, err
//		}
//	}
//
//	return nil, nil
//}
//

type ArticleUrl string

func (a ArticleUrl) String() string {
	return string(a)
}

// FindBilingualPages finds pages in different languages
// including the original language of the article
func (e Elpais) FindBilingualPages(ctx context.Context, articleUrl ArticleUrl) (*Page, error) {
	// 1. Makes the http request
	// TODO timeout
	request, err := http.NewRequestWithContext(ctx, "GET", articleUrl.String(), nil)
	if err != nil {
		return nil, err
	}
	res, err := e.HttpClient.Do(request)
	if err != nil {
		return nil, err
	}

	// 2. Parse the HTML, looking for versions of the article in different languages
	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	page := Page{
		Provider: "elpais",
	}

	doc.Find(`link[rel="alternate"]`).Each(func(i int, s *goquery.Selection) {
		link := Link{}

		href, ok := s.Attr("href")
		if !ok {
			return
		}

		lang, ok := s.Attr("hreflang")
		if !ok {
			return
		}

		link.Lang = lang
		link.Url = href

		page.Links = append(page.Links, link)
	})

	if len(page.Links) > 0 {
		return &page, nil
	}

	return nil, nil
}

func (e *Elpais) FetchPagesList() ([]Page, error) {
	ctx := context.TODO()

	feed, err := e.RSS(ctx)
	if err != nil {
		return nil, err
	}

	type Result struct {
		Page  *Page
		Error error
	}

	totalItems := len(feed.Items)
	responses := make([]Page, 0, totalItems)
	ch := make(chan Result, e.Config.MaxConcurrent)

	// Start a go routine for every item
	for _, item := range feed.Items {
		go func(item *gofeed.Item) {
			page, err := e.process(item)
			ch <- Result{Page: page, Error: err}
		}(item)
	}

	// process all items
	for i := 0; i < totalItems; i++ {
		article := <-ch
		if article.Page != nil {
			// article link to something else other than itself
			if len(article.Page.Links) > 1 {
				responses = append(responses, *article.Page)
			}
		}
	}

	return responses, nil
}

// RSS scrapes the RSS feed
// validates that the language is supported
// and then return the feed
func (e *Elpais) RSS(ctx context.Context) (*gofeed.Feed, error) {
	feed, err := e.RssGetter.Get(ctx, "https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada")
	if err != nil {
		return nil, err
	}

	// Validate it's a language we support
	switch feed.Language {
	case "pt-br", "es":
	default:
		return nil, ErrInvalidLanguage
	}

	return feed, nil
}

func (e *Elpais) process(item *gofeed.Item) (*Page, error) {
	// TODO
	// timeout
	request, err := http.NewRequest("GET", item.Link, nil)
	if err != nil {
		return nil, err
	}

	res, err := e.HttpClient.Do(request)
	// Maybe we don't want to fail when there's an error
	if err != nil {
		return nil, err
	}

	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	page := Page{
		Provider: "elpais",
	}

	doc.Find(`link[rel="alternate"]`).Each(func(i int, s *goquery.Selection) {
		link := Link{}

		href, ok := s.Attr("href")
		if !ok {
			return
		}

		lang, ok := s.Attr("hreflang")
		if !ok {
			return
		}

		link.Lang = lang
		link.Url = href

		page.Links = append(page.Links, link)
	})

	return &page, nil
}
