package providers

import (
	"context"

	"github.com/mmcdole/gofeed"
)

type RSSGet struct{}

func (r *RSSGet) Get(ctx context.Context, url string) (*gofeed.Feed, error) {
	p := gofeed.NewParser()

	return p.ParseURLWithContext(url, ctx)
}
