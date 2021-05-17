import { readFileSync } from 'fs';
import { Article } from '../../components/article';

interface ElPaisArticle {
  byline: string;
  content: string[];
  excerpt: string;
  image: string;
  length: number;
  siteName: string;
  textContent: string;
  title: string;
  url: string;
}

interface ElPaisPage {
  id: string;
  'es-es': ElPaisArticle;
  'pt-br': ElPaisArticle;
}

export default function Page(props: { page: ElPaisPage }): any {
  const divStyle = {
    display: 'flex',
    maxWidth: '800px',
    margin: '0 auto',
  };

  return (
    <div className="articles" style={divStyle}>
      <Article
        article1={props.page['pt-br']}
        article2={props.page['es-es']}
      ></Article>
    </div>
  );
}

function loadPages() {
  let articlesPath = '';
  switch (process.env.NODE_ENV) {
    default: {
      articlesPath = '../data/elpais.json';
    }
  }

  // TODO
  // validate with zod
  const res = JSON.parse(readFileSync(articlesPath, 'utf8'));
  return res;
}

export async function getStaticProps(context: any) {
  const res = loadPages();

  const page = res.find((a: any) => a.id == context.params.id);

  return {
    props: {
      page,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths() {
  const res = loadPages();

  const params = res.map((a: any) => ({
    params: { id: a.id },
  }));

  return {
    paths: [...params],
    fallback: false,
  };
}
