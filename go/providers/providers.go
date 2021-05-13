package providers

import "errors"

type Page struct {
	Links    []Link `json:"links"`
	Provider string `json:"provider"`
}

type Link struct {
	Url  string `json:"url"`
	Lang string `json:"lang"`
}

type ProcessedPage struct {
	Link,
	Title string
	Body []string
}

var (
	ErrInvalidLanguage = errors.New("language not supported")
)
