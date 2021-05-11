package providers

import (
	"context"
	"errors"
	"net/http"

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
}

type Items []struct {
	gofeed.Item

	// TODO
	language string
}
type ArticleMeta struct {
	links []link
}

type link struct {
	url  string
	lang string
}

var (
	ErrInvalidLanguage = errors.New("language not supported")
)

func (e *Elpais) Scrape() ([]ArticleMeta, error) {
	ctx := context.TODO()

	feed, err := e.rss(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]ArticleMeta, len(feed.Items))

	// for each item
	// TODO go routine
	for _, item := range feed.Items {
		request, err := http.NewRequest("GET", item.Link, nil)
		if err != nil {
			return nil, err
		}

		res, err := e.HttpClient.Do(request)
		// Maybe we don't want to fail when there's an error
		if err != nil {
			return nil, err
		}

		//		var buf bytes.Buffer
		//		buf.ReadFrom(res.Body)
		//		// TODO
		//		responses = append(responses, buf.String())

		// Load the HTML document
		doc, err := goquery.NewDocumentFromReader(res.Body)
		if err != nil {
			return nil, err
		}

		// Title
		//		title := doc.Find(`[property="og:title"]`)
		//		titleText, exists := title.Attr("content")
		//		if !exists {
		//			return nil, errors.New("content does not exist for title")
		//		}

		article := ArticleMeta{}
		//		doc.Find(`link[rel="alternate"]`).Each(func(i int, s *goquery.Selection) {
		doc.Find(`link[rel="alternate"]`).Each(func(i int, s *goquery.Selection) {
			link := link{}

			href, ok := s.Attr("href")
			if !ok {
				return
			}

			lang, ok := s.Attr("hreflang")
			if !ok {
				return
			}

			link.lang = lang
			link.url = href

			article.links = append(article.links, link)
		})

		if len(article.links) > 0 {
			responses = append(responses, article)
		}

	}

	return responses, nil
}

// rss scrapes the rss feed
// validates that the language is supported
// and then return the feed
func (e *Elpais) rss(ctx context.Context) (*gofeed.Feed, error) {
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
