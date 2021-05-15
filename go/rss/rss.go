package rss

import (
	"context"

	"github.com/mmcdole/gofeed"
)

type Gofeed struct{}

func (r *Gofeed) Get(ctx context.Context, url string) (*gofeed.Feed, error) {
	p := gofeed.NewParser()

	return p.ParseURLWithContext(url, ctx)
}
