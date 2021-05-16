package elpais

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/go-shiori/go-readability"
	"github.com/mmcdole/gofeed"
	"golang.org/x/sync/errgroup"
)

// RSSGetter gets a gofeed.Feed from a URL
type RssGetter interface {
	Get(ctx context.Context, url string) (*gofeed.Feed, error)
}

// HTTPClient dos HTTP Requests
type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

// Provider refers to the interface to interact with elpais
type Provider struct {
	RssGetter
	HttpClient
}

func NewProvider(RssGetter RssGetter, HttpClient HttpClient) *Provider {
	return &Provider{
		RssGetter,
		HttpClient,
	}
}

// RSS scrapes the RSS feed
// validates that the language is supported
// and then return the feed
func (e *Provider) RSS(ctx context.Context) (*gofeed.Feed, error) {
	// TODO: what if we want to use different RSS feeds
	feed, err := e.RssGetter.Get(ctx, "https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada")
	if err != nil {
		return nil, err
	}

	// Validate it's a language we support
	switch feed.Language {
	case "pt-br", "es":
	default:
		return nil, errors.New("invalid language" + feed.Language)
	}

	return feed, nil
}

// FindBilingualPages finds pages in different languages
// including the original language of the article
func (e *Provider) FindBilingualPages(ctx context.Context, articleUrl string, published *time.Time) (*Page, error) {
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
		Provider:  "elpais",
		Published: published,
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

	// a page needs to have at least couple links
	// 1 for itself
	// 2 for the other page
	if len(page.Links) > 1 {
		return &page, nil
	}

	return nil, nil
}

// ProcessPage processes a page returning it
func (e Provider) ProcessPage(ctx context.Context, page Page) (*ElPaisArticle, error) {
	g, ctx := errgroup.WithContext(ctx)

	elPaisArticle := ElPaisArticle{
		// this published field is not fully honest
		// since it uses the published version of the article in the
		// rss feed
		Published: page.Published,
	}

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
			//			a.Content = article.Content
			a.TextContent = article.TextContent
			a.Length = article.Length
			a.Excerpt = article.Excerpt
			a.SiteName = article.SiteName
			a.Image = article.Image

			a.Content = make([]string, 0, 0)

			// let's break the body into multiple nodes
			// so that they can be manipulated independently in the frontend
			doc, err := goquery.NewDocumentFromReader(strings.NewReader(article.Content))
			sel := doc.Find("#readability-page-1 > div").Children()

			for i := range sel.Nodes {
				single := sel.Eq(i)
				h, err := goquery.OuterHtml(single)
				if err != nil {
					return err
				}
				a.Content = append(a.Content, h)
			}

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
