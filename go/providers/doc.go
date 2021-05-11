// package providers refers to the providers of bilingual articles
package providers

// Provider provides pages to be fetched
type Provider interface {
	// FetchPagesList	 fetches list of pages
	// that ban be processed
	FetchPagesList() ([]Page, error)

	// Process processes a page given a link
	Process(l Link) (ProcessedPage, error)
}
