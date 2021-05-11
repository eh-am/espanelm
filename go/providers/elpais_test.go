package providers_test

import (
	"bilingual-articles/providers"
	"context"
	"net/http"
	"os"
	"testing"

	"github.com/google/go-cmp/cmp"
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

	got, err := elpais.FetchPagesList()
	if err != nil {
		t.Fatalf("did not expect error %+v", err)
	}

	want := []providers.Page{
		{Links: []providers.Link{
			{Url: "https://brasil.elpais.com/cultura/2021-05-09/agua-de-murta-o-desodorante-de-isabel-a-catolica.html", Lang: "pt-BR"},
			{Url: "https://elpais.com/cultura/2021-05-07/agua-de-murta-el-desodorante-de-isabel-la-catolica.html", Lang: "es-ES"}},
		},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/cultura/2021-05-07/a-falta-de-veia-comica-de-keanu-reeves-na-insuportavel-sequencia-de-um-sucesso-dos-anos-noventa.html", Lang: "pt-BR"}, {Url: "https://elpais.com/cultura/2021-05-07/bill-y-ted-salvan-el-universo-la-falta-de-vis-comica-de-keanu-reeves-en-una-insufrible-secuela-de-un-exito-de-los-noventa.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-08/dezenas-de-mortos-em-varias-explosoes-ao-lado-de-escola-para-meninas-em-cabul.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-08/decenas-de-muertos-en-un-atentado-junto-a-una-escuela-de-ninas-en-kabul.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-07/ex-policiais-envolvidos-na-morte-de-george-floyd-sao-acusados-de-violar-os-direitos-civis.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-07/los-cuatro-expolicias-involucrados-en-la-muerte-de-george-floyd-acusados-de-violar-los-derechos-civiles-del-afroamericano.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-07/a-dura-batalha-pela-sucessao-no-trono-zulu.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-07/el-misterio-de-la-sucesion-en-el-trono-zulu.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-07/ortega-impoe-reforma-eleitoral-na-nicaragua-e-eua-o-acusam-de-organizar-eleicoes-viciadas.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-06/ortega-impone-una-reforma-electoral-a-su-medida-y-ee-uu-lo-acusa-de-organizar-unas-elecciones-viciadas.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-06/maduro-faz-concessoes-para-retomar-contatos-com-a-comunidade-internacional.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-06/las-concesiones-de-maduro-para-descomprimir-el-cerco-internacional.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/esportes/2021-05-05/egoista-exibicionista-ou-bom-demais-por-que-neymar-e-um-dos-jogadores-mais-odiados-do-mundo.html", Lang: "pt-BR"}, {Url: "https://elpais.com/icon/actualidad/2021-05-05/egoista-exhibicionista-o-demasiado-bueno-por-que-es-neymar-jr-uno-de-los-futbolistas-mas-odiados-del-mundo.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/esportes/2021-04-26/diante-da-proibicao-de-executar-o-hino-da-russia-nos-jogos-de-toquio-putin-poe-tchaikovski-para-tocar-na-olimpiada.html", Lang: "pt-BR"}, {Url: "https://elpais.com/deportes/2021-04-26/putin-hara-olimpico-a-chaikovski.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/esportes/2021-04-21/a-grande-rebeliao-inglesa-contra-a-superliga.html", Lang: "pt-BR"}, {Url: "https://elpais.com/deportes/2021-04-20/johnson-amenaza-con-una-bomba-legislativa-para-frenar-la-superliga.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-03/falta-de-oxigenio-crematorios-superlotados-e-mercado-clandestino-a-devastacao-na-india.html", Lang: "pt-BR"}, {Url: "https://elpais.com/sociedad/2021-05-03/falta-de-oxigeno-crematorios-desbordados-y-mercado-negro-la-devastacion-en-la-india.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/sociedade/2021-04-30/resete-sua-mente.html", Lang: "pt-BR"}, {Url: "https://elpais.com/elpais/2021/04/27/laboratorio_de_felicidad/1619509312_051384.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/cultura/2021-04-27/caminhamos-pros-novos-anos-loucos-de-hedonismo-pos-covid.html", Lang: "pt-BR"}, {Url: "https://elpais.com/ideas/2021-04-25/caminamos-hacia-unos-locos-anos-veinte.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/cultura/2021-04-26/trabalhar-cansa-e-descansar-nos-deixa-esgotados.html", Lang: "pt-BR"}, {Url: "https://elpais.com/babelia/2021-04-24/trabajar-cansa-y-descansar-nos-tiene-agotados.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/internacional/2021-05-03/espanha-cobra-o-desbloqueio-do-acordo-da-uniao-europeia-com-o-mercosul.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-05-03/espana-reclama-a-bruselas-que-desbloquee-el-acuerdo-con-mercosur.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/brasil/2021-04-25/o-superpoder-da-soja-no-brasil.html", Lang: "pt-BR"}, {Url: "https://elpais.com/internacional/2021-04-24/el-superpoder-de-la-soja-en-brasil.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/economia/2021-04-24/china-desafia-a-soberba-da-tesla-de-elon-musk.html", Lang: "pt-BR"}, {Url: "https://elpais.com/economia/2021-04-24/china-desafia-la-soberbia-de-tesla.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/ciencia/2021-05-02/quatro-astronautas-retornam-da-estacao-espacial-em-uma-capsula-privada-da-space-x.html", Lang: "pt-BR"}, {Url: "https://elpais.com/ciencia/2021-05-02/cuatro-astronautas-regresan-de-la-estacion-espacial-en-una-capsula-privada-de-space-x.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/ciencia/2021-04-22/nasa-produz-oxigenio-respiravel-em-marte.html", Lang: "pt-BR"}, {Url: "https://elpais.com/ciencia/2021-04-22/ee-uu-produce-oxigeno-respirable-en-marte.html", Lang: "es-ES"}}},

		{Links: []providers.Link{{Url: "https://brasil.elpais.com/ciencia/2021-04-19/nasa-pilota-um-drone-em-outro-planeta-pela-primeira-vez.html", Lang: "pt-BR"}, {Url: "https://elpais.com/ciencia/2021-04-19/la-nasa-vuela-un-dron-en-otro-planeta-por-primera-vez.html", Lang: "es-ES"}}}}

	if diff := cmp.Diff(want, got); diff != "" {
		t.Errorf("TestElPais() mismatch (-want +got):\n%s", diff)
	}
}
