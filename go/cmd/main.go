package main

import (
	"bilingual-articles/cmd/internal"
	"bilingual-articles/log"
	"bilingual-articles/providers/elpais"
	"bilingual-articles/rss"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	l "log"
	"net/http"
	"os"
	"time"

	"github.com/peterbourgon/ff/v3/ffcli"
)

func main() {
	var (
		rootFlagSet = flag.NewFlagSet("espanelm", flag.ExitOnError)

		downloadFlagSet = flag.NewFlagSet("download", flag.ExitOnError)
		downloadDest    = downloadFlagSet.String("dest", "", "where to download")

		elPaisCmdFlagSet = flag.NewFlagSet("elpais", flag.ExitOnError)

		elPaisFlagSet = flag.NewFlagSet("elpais", flag.ExitOnError)
	)

	download := &ffcli.Command{
		Name:       "download",
		ShortUsage: "download [-dest folder]",
		ShortHelp:  "download bilingual articles. useful for pulling data for testing",
		FlagSet:    downloadFlagSet,
		Exec: func(ctx context.Context, args []string) error {
			if *downloadDest == "" {
				return flag.ErrHelp
			}

			logger := log.LoggerFunc(l.Println)

			// Setup
			ctx, cancel := context.WithTimeout(ctx, time.Minute*5)
			defer cancel()

			// Dependencies
			provider := elpais.NewProvider(&rss.Gofeed{}, &http.Client{})
			runner := elpais.NewRunner(provider, logger, 2)

			// get the links from rss
			feed, err := provider.RSS(ctx)
			if err != nil {
				return err
			}

			pages := runner.FindBilingualPages(ctx, feed)

			links := make([]string, 0, len(pages))
			for _, page := range pages {
				for _, link := range page.Links {
					links = append(links, link.Url)
				}
			}

			logger.Log("Downloading", len(pages), "bilingual pages")
			for i := 0; i < len(pages); i++ {
				links[i] = feed.Items[i].Link
			}

			err = internal.Download(ctx, logger, links, *downloadDest)
			if err != nil {
				return err
			}

			return nil
		},
	}

	elpaisRunCmd := &ffcli.Command{
		Name:       "run",
		ShortUsage: "run",
		ShortHelp:  "do the whole elpais song and dance",
		FlagSet:    elPaisFlagSet,
		Exec: func(ctx context.Context, args []string) error {

			ctx, cancel := context.WithTimeout(ctx, time.Minute*5)
			defer cancel()

			provider := elpais.NewProvider(&rss.Gofeed{}, &http.Client{})
			runner := elpais.NewRunner(provider, log.LoggerFunc(l.Println), 2)

			articles, err := runner.Run(ctx)
			if err != nil {
				return err
			}

			js, err := json.Marshal(articles)
			if err != nil {
				return err
			}

			fmt.Println(string(js))

			return nil
		},
	}

	elpaisCmd := &ffcli.Command{
		Name:        "elpais",
		ShortHelp:   "functions for the elpais provider",
		ShortUsage:  "elpais <subcommand>",
		FlagSet:     elPaisCmdFlagSet,
		Subcommands: []*ffcli.Command{download, elpaisRunCmd},
		Exec: func(context.Context, []string) error {
			return flag.ErrHelp
		},
	}

	root := &ffcli.Command{
		ShortUsage:  "espanelm <subcommand>",
		FlagSet:     rootFlagSet,
		Subcommands: []*ffcli.Command{download, elpaisCmd},
		Exec: func(context.Context, []string) error {
			return flag.ErrHelp
		},
	}

	if err := root.ParseAndRun(context.Background(), os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}
