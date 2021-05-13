package main

import (
	"bilingual-articles/providers"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"

	"github.com/peterbourgon/ff/v3/ffcli"
)

func main() {
	var (
		rootFlagSet = flag.NewFlagSet("espanelm", flag.ExitOnError)

		rssFlagSet  = flag.NewFlagSet("rss", flag.ExitOnError)
		rssProvider = rssFlagSet.String("provider", "elpais", "what provider to use. (Available: 'elpais')")
	)

	rss := &ffcli.Command{
		Name:       "rss",
		ShortUsage: "espanelm rss [-p provider]",
		ShortHelp:  "print the target articles fetched from RSS feed",
		FlagSet:    rssFlagSet,
		Exec: func(_ context.Context, args []string) error {
			switch *rssProvider {
			case "elpais":
				elpais := providers.NewElPais(
					&providers.RSSGet{},
					&http.Client{},
					providers.Config{},
				)

				pages, err := elpais.FetchPagesList()
				if err != nil {
					return err
				}

				marshalled, err := json.Marshal(pages)
				if err != nil {
					return err
				}

				fmt.Fprint(os.Stdout, string(marshalled))
			default:
				return errors.New("invalid provider")
			}
			return nil
		},
	}

	root := &ffcli.Command{
		ShortUsage:  "espanelm <subcommand>",
		FlagSet:     rootFlagSet,
		Subcommands: []*ffcli.Command{rss},
		Exec: func(context.Context, []string) error {
			return flag.ErrHelp
		},
	}

	if err := root.ParseAndRun(context.Background(), os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}
