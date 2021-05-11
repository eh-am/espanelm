package providers

import "errors"

type Page struct {
	Links []Link
}

type Link struct {
	Url  string
	Lang string
}

type ProcessedPage struct {
	Link,
	Title string
	Body []string
}

var (
	ErrInvalidLanguage = errors.New("language not supported")
)
