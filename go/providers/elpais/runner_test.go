package elpais_test

import (
	"bilingual-articles/providers/elpais"
	"context"
	"testing"
	"time"

	"github.com/mmcdole/gofeed"
	"github.com/stretchr/testify/assert"
)

type MockProvider struct{}

func (e *MockProvider) RSS(ctx context.Context) (*gofeed.Feed, error) {
	// TODO
	// generate more

	now := time.Now()
	return &gofeed.Feed{
		// 8 items
		PublishedParsed: &now,
		Items: []*gofeed.Item{
			{Link: "https://brasil.elpais.com/internacional/2021-05-12/israel-e-hamas-intensificam-ataques-em-ofensiva-com-pelo-menos-60-mortos.html"},
			{Link: "https://elpais.com/internacional/2021-05-12/israel-y-hamas-intensifican-sus-ataques-en-una-ofensiva-con-decenas-de-muertos.html"},

			{Link: "https://brasil.elpais.com/internacional/2021-05-12/israel-e-hamas-intensificam-ataques-em-ofensiva-com-pelo-menos-60-mortos.html"},
			{Link: "https://elpais.com/internacional/2021-05-12/israel-y-hamas-intensifican-sus-ataques-en-una-ofensiva-con-decenas-de-muertos.html"},

			{Link: "https://brasil.elpais.com/internacional/2021-05-12/israel-e-hamas-intensificam-ataques-em-ofensiva-com-pelo-menos-60-mortos.html"},
			{Link: "https://elpais.com/internacional/2021-05-12/israel-y-hamas-intensifican-sus-ataques-en-una-ofensiva-con-decenas-de-muertos.html"},

			{Link: "https://brasil.elpais.com/internacional/2021-05-12/israel-e-hamas-intensificam-ataques-em-ofensiva-com-pelo-menos-60-mortos.html"},
			{Link: "https://elpais.com/internacional/2021-05-12/israel-y-hamas-intensifican-sus-ataques-en-una-ofensiva-con-decenas-de-muertos.html"},
		},
	}, nil
}

func (e *MockProvider) FindBilingualPages(ctx context.Context, articleUrl string, published *time.Time) (*elpais.Page, error) {
	// TODO
	// generate random
	return &elpais.Page{
		Published: published,
		Provider:  "elpais", Links: []elpais.Link{
			{Url: "https://brasil.elpais.com/cultura/2021-05-09/agua-de-murta-o-desodorante-de-isabel-a-catolica.html", Lang: "pt-BR"},
			{Url: "https://elpais.com/cultura/2021-05-07/agua-de-murta-el-desodorante-de-isabel-la-catolica.html", Lang: "es-ES"}},
	}, nil

}
func (e *MockProvider) ProcessPage(ctx context.Context, page elpais.Page) (*elpais.ElPaisArticle, error) {
	return &elpais.ElPaisArticle{
		Published: page.Published,
		PtBr: elpais.ReadableArticle{
			Url:      "https://brasil.elpais.com/cultura/2021-05-09/agua-de-murta-o-desodorante-de-isabel-a-catolica.html",
			Title:    "Água de murta, o desodorante de Isabel, a Católica",
			Byline:   "Manuel Morales",
			Content:  []string{""},
			Length:   6333,
			Excerpt:  "Arquivo de um funcionário da realeza, conservado por cinco séculos, revela a grande atenção que a rainha dava a sua higiene e aspecto, contrariando a lenda urbana que a tachou de desasseada",
			SiteName: "EL PAÍS",
			Image:    "https://imagens.brasil.elpais.com/resizer/EFpQVmepnYuQpgSY1miWyNkBsiY=/1200x0/filters:focal(1777x2097:1787x2107)/cloudfront-eu-central-1.images.arcpublishing.com/prisa/U5XJ4IPW5ZBU5NBIJUNFG5BKAE.jpeg",
		},
		EsEs: elpais.ReadableArticle{
			Url:      "https://elpais.com/cultura/2021-05-07/agua-de-murta-el-desodorante-de-isabel-la-catolica.html",
			Title:    "Agua de murta, el desodorante de Isabel la Católica",
			Byline:   "Manuel Morales",
			Content:  []string{""},
			SiteName: "EL PAÍS",
			Image:    "https://imagenes.elpais.com/resizer/EFpQVmepnYuQpgSY1miWyNkBsiY=/1200x0/filters:focal(1777x2097:1787x2107)/cloudfront-eu-central-1.images.arcpublishing.com/prisa/U5XJ4IPW5ZBU5NBIJUNFG5BKAE.jpeg"},
	}, nil
}

func TestElPaisRunner(t *testing.T) {
	ep := elpais.NewRunner(
		&MockProvider{},
		t,
		2,
	)

	articles, err := ep.Run(context.TODO())
	assert.NoError(t, err)

	assert.Equal(t, 8, len(articles))
}
