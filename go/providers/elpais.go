package providers

import (
	"context"
	"errors"
	"net/http"
	"runtime"

	"github.com/PuerkitoBio/goquery"
	readability "github.com/go-shiori/go-readability"
	"github.com/mmcdole/gofeed"
	"golang.org/x/sync/errgroup"
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

type ElPaisArticle struct {
	PtBr ReadableArticle `json:"pt-br"`
	EsEs ReadableArticle `json:"es-es"`
}

// ReadableArticle represents an article ready to be consumed
// Ie. after been processed by
type ReadableArticle struct {
	// Fields copied from readability.Article
	Title       string
	Byline      string
	Content     string
	TextContent string
	Length      int
	Excerpt     string
	SiteName    string
	Image       string

	Url string
}

// ProcessPage processes a page returning it
func (e Elpais) ProcessPage(ctx context.Context, page Page) (*ElPaisArticle, error) {
	g, ctx := errgroup.WithContext(ctx)

	elPaisArticle := ElPaisArticle{}

	for _, p := range page.Links {
		p := p

		g.Go(func() error {
			request, err := http.NewRequestWithContext(ctx, "GET", p.Url, nil)
			if err != nil {
				return err
			}
			res, err := e.HttpClient.Do(request)
			if err != nil {
				return err
			}

			article, err := readability.FromReader(res.Body, p.Url)

			a := ReadableArticle{}
			a.Url = p.Url
			a.Title = article.Title
			a.Byline = article.Byline
			a.Content = article.Content
			a.TextContent = article.TextContent
			a.Length = article.Length
			a.Excerpt = article.Excerpt
			a.SiteName = article.SiteName
			a.Image = article.Image

			switch p.Lang {
			case "pt-BR":
				elPaisArticle.PtBr = a
			case "es-ES":
				elPaisArticle.EsEs = a
			default:
				return errors.New("unsupported language " + p.Lang)
			}

			return nil
		})
	}

	err := g.Wait()
	if err != nil {
		return nil, err
	}

	return &elPaisArticle, nil
}

// FindBilingualPages finds pages in different languages
// including the original language of the article
func (e Elpais) FindBilingualPages(ctx context.Context, articleUrl string) (*Page, error) {
	// 1. Makes the http request
	// TODO timeout
	request, err := http.NewRequestWithContext(ctx, "GET", articleUrl, nil)
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
