package providers_test

import (
	"bilingual-articles/providers"
	"context"
	"net/http"
	"os"
	"testing"

	"github.com/mmcdole/gofeed"
)

type mockRssGetter struct{}

func (m *mockRssGetter) Get(ctx context.Context, url string) (*gofeed.Feed, error) {
	f, err := os.Open("../testdata/portaad-10-may-2021.xml")
	if err != nil {
		panic(err)
	}

	return gofeed.NewParser().Parse(f)
}

type mockHttpClient struct{}

func (m *mockHttpClient) Do(req *http.Request) (*http.Response, error) {
	f, err := os.Open("../testdata/" + req.URL.Host + req.URL.Path)
	if err != nil {
		panic(err)
	}

	// TODO based on url
	return &http.Response{
		StatusCode: 200,
		Body:       f,
	}, nil
}

func TestElPaisFindBilingualPages(t *testing.T) {
	ep := providers.Elpais{
		HttpClient: &mockHttpClient{},
	}

	type args struct {
		url  providers.ArticleUrl
		want *providers.Page
	}

	tc := []args{
		{
			url: "https://brasil.elpais.com/cultura/2021-05-09/agua-de-murta-o-desodorante-de-isabel-a-catolica.html",
			want: &providers.Page{
				Provider: "elpais", Links: []providers.Link{
					{Url: "https://brasil.elpais.com/cultura/2021-05-09/agua-de-murta-o-desodorante-de-isabel-a-catolica.html", Lang: "pt-BR"},
					{Url: "https://elpais.com/cultura/2021-05-07/agua-de-murta-el-desodorante-de-isabel-la-catolica.html", Lang: "es-ES"}},
			},
		},

		{
			url:  "https://brasil.elpais.com/internacional/2021-05-03/espanha-cobra-o-desbloqueio-do-acordo-da-uniao-europeia-com-o-mercosul.html",
			want: &providers.Page{Provider: "elpais", Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-03/espanha-cobra-o-desbloqueio-do-acordo-da-uniao-europeia-com-o-mercosul.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-03/espana-reclama-a-bruselas-que-desbloquee-el-acuerdo-con-mercosur.html", Lang: "es-ES"}}},
		},

		// Article that does not have a bilingual version
		{
			url:  "http://brasil.elpais.com/brasil/2021/04/16/album/1618596565_470682.html",
			want: nil,
		},
	}

	for _, tt := range tc {
		t.Run(tt.url.String(), func(t *testing.T) {
			got, err := ep.FindBilingualPages(
				context.TODO(),
				tt.url,
			)
			assert.NoError(t, err)

			assert.Equal(t, tt.want, got)
		})
	}
}
