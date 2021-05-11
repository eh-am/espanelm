package providers_test

import (
	"bilingual-articles/providers"
	"context"
	"fmt"
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
	fmt.Println(req.URL, req.URL.Path)

	f, err := os.Open("../testdata/" + req.URL.Path)
	if err != nil {
		panic(err)
	}

	// TODO based on url
	return &http.Response{
		StatusCode: 200,
		Body:       f,
	}, nil
}

func TestElPais(t *testing.T) {
	elpais := providers.Elpais{
		&mockRssGetter{},
		&mockHttpClient{},
	}

	res, err := elpais.Scrape()
	if err != nil {
		t.Fatalf("did not expect error %+v", err)
	}

	t.Log("title", res)
}
