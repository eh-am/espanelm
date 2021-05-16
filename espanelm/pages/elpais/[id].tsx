import { readFileSync } from 'fs';
import { useState, useEffect } from 'react';

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

function Article(props: { article1: ElPaisArticle; article2: ElPaisArticle }) {
  const [articles, setArticles] = useState(props);

  const rows: [string, string][] = [];

  function update() {
    for (
      let i = 0;
      i < articles.article1.content.length ||
      i < articles.article2.content.length;
      i++
    ) {
      const col1 = articles.article1.content[i]
        ? articles.article1.content[i]
        : '';
      const col2 = articles.article2.content[i]
        ? articles.article2.content[i]
        : '';

      rows[i] = [col1, col2];
    }
  }
  useEffect(() => {
    update();
  }, [articles]);
  update();

  const style = {
    display: 'flex',
  };

  const styleCol = {
    flex: '50%',
    margin: '0 12px',
  };

  function handleClick(e: any, name: 'article1' | 'article2', index: any) {
    e.preventDefault();

    // TODO
    // is this a good copy?
    const articlesCopied = { ...articles };

    // remove that item
    articlesCopied[name].content.splice(index, 1);

    console.log('setting articles as null');
    setArticles({
      article1: articlesCopied.article1,
      article2: articlesCopied.article2,
    });
  }
  return (
    <div>
      {rows.map((c, i) => (
        <div className="row" key={i} style={style}>
          <div
            className="column"
            onClick={(e) => handleClick(e, 'article1', i)}
            style={styleCol}
            dangerouslySetInnerHTML={createMarkup(c[0])}
          ></div>
          <div
            className="column"
            onClick={(e) => handleClick(e, 'article2', i)}
            style={styleCol}
            dangerouslySetInnerHTML={createMarkup(c[1])}
          ></div>
        </div>
      ))}
    </div>
  );
}

function createMarkup(c: any) {
  return { __html: c };
}

export async function getStaticProps(context: any) {
  const res = JSON.parse(readFileSync('testdata/articles.json', 'utf8'));

  const page = res.find((a: any) => a.id == context.params.id);

  return {
    props: {
      page,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths() {
  switch (process.env.NODE_ENV) {
    case 'development':
      break;

    default: {
      throw new Error('Not implemented');
    }
  }

  // TODO
  // validate with zod
  const res = JSON.parse(readFileSync('testdata/articles.json', 'utf8'));

  const params = res.map((a: any) => ({
    params: { id: a.id },
  }));

  return {
    paths: [...params],
    fallback: false,
  };
}
