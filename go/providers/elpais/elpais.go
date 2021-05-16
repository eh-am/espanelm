package elpais

import "time"

type ElPaisArticle struct {
	Published *time.Time      `json:"published,omitempty"`
	PtBr      ReadableArticle `json:"pt-br"`
	EsEs      ReadableArticle `json:"es-es"`
}

// TODO: move this somewhere else
// ReadableArticle represents an article ready to be consumed
// Ie. after been processed by
type ReadableArticle struct {
	// Fields copied from readability.Article
	Title       string
	Byline      string
	Content     []string
	TextContent string
	Length      int
	Excerpt     string
	SiteName    string
	Image       string

	Url string
}

type Page struct {
	Links     []Link     `json:"links"`
	Provider  string     `json:"provider"`
	Published *time.Time `json:"published,omitempty"`
}

// TODO use this instead plain Page
// add fields like eses ptbr
type BilingualPage struct {
	Links     []Link     `json:"links"`
	Provider  string     `json:"provider"`
	Published *time.Time `json:"published,omitempty"`
}

type Link struct {
	Url  string `json:"url"`
	Lang string `json:"lang"`
}
