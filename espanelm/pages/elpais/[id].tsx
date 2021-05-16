import { readFileSync } from 'fs';
import { useState, useEffect } from 'react';

export default function Page(props: any) {
  const divStyle = {
    display: 'flex',
    maxWidth: '800px',
    margin: '0 auto',
  };

  return (
    <div className="articles" style={divStyle}>
      <Article
        article1={props['pt-br'].Content}
        article2={props['es-es'].Content}
      ></Article>
    </div>
  );
}

function Article(props: any) {
  const [articles, setArticles] = useState(props);

  let rows: any[] = [];

  function update() {
    for (
      let i = 0;
      i < articles.article1.length || i < articles.article2.length;
      i++
    ) {
      const col1 = articles.article1[i] ? articles.article1[i] : '';
      const col2 = articles.article2[i] ? articles.article2[i] : '';

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

  function handleClick(e: any, name: any, index: any) {
    e.preventDefault();

    // TODO
    // is this a good copy?
    const articlesCopied = { ...articles };

    // remove that item
    articlesCopied[name].splice(index, 1);

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
  const res = JSON.parse(readFileSync('fakedata.json', 'utf8'));

  const page = res.find((a: any) => a.id == context.params.id);

  return {
    props: {
      ...page,
    }, // will be passed to the page component as props
  };
}

export async function getStaticPaths() {
  // TODO
  // validate with zod
  const res = JSON.parse(readFileSync('fakedata.json', 'utf8'));

  const params = res.map((a: any) => ({
    params: { id: a.id },
  }));

  return {
    paths: [...params],
    fallback: false,
  };
}
