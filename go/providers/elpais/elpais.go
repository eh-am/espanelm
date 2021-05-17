package elpais

import "time"

type ElPaisArticle struct {
	Id        string          `json:"id"`
	Published *time.Time      `json:"published,omitempty"`
	PtBr      ReadableArticle `json:"pt-br"`
	EsEs      ReadableArticle `json:"es-es"`
}

// TODO: move this somewhere else
// ReadableArticle represents an article ready to be consumed
// Ie. after been processed by
type ReadableArticle struct {
	// Fields copied from readability.Article
	Title       string   `json:"title"`
	Byline      string   `json:"byline"`
	Content     []string `json:"content"`
	TextContent string   `json:"textContent"`
	Length      int      `json:"length"`
	Excerpt     string   `json:"excerpt"`
	SiteName    string   `json:"siteName"`
	Image       string   `json:"image"`

	Url string `json:"url"`
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
