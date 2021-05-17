import { useState } from 'react';

interface IArticle {
  content: string[];
  title: string;
}

type Paragraph =
  | {
      artificial: true;
    }
  | {
      artificial: false;
      content: string;
      visible: boolean;
    };

function Article(props: { article1: IArticle; article2: IArticle }) {
  const [art, setArt] = useState({
    article1: {
      ...props.article1,
      content: initParagraph(props.article1.content),
    },
    article2: {
      ...props.article2,
      content: initParagraph(props.article2.content),
    },
  });

  const style = {
    display: 'flex',
  };

  const styleCol = {
    flex: '50%',
    margin: '0 12px',
  };

  function handleClick(e: any, name: 'article1' | 'article2', index: any) {
    e.preventDefault();

    const artCopied = { ...art };
    const reverse = name == 'article1' ? 'article2' : 'article1';
    const p = artCopied[name].content[index];

    // nothing to be done when an artificial paragraph was clicked
    if (p.artificial) {
      return;
    }

    if (p.visible) {
      // Hide it
      p.visible = false;

      // Insert an artificial item on the opposite column
      artCopied[reverse].content.splice(index, 0, {
        artificial: true,
      });
    } else {
      // Hide it
      p.visible = true;

      // Remove the artificial item
      artCopied[reverse].content.splice(index, 1);
    }

    artCopied[name].content[index];
    setArt(artCopied);
  }

  function mergeParagraphs(col1: Paragraph[], col2: Paragraph[]) {
    const rows: [string, string][] = [];
    let i = 0;
    let j = 0;

    while (i < col1.length || j < col2.length) {
      let p1 = '';
      let p2 = '';

      const c1 = col1[i];
      if (c1 && !c1.artificial && c1.content) {
        if (c1.visible) {
          p1 = c1.content;
        } else {
          p1 =
            '<p data-testid="hidden">This paragraph was hidden. Click to show it again.</p>';
        }
      }

      const c2 = col2[j];
      if (c2 && !c2.artificial && c2.content) {
        if (c2.visible) {
          p2 = c2.content;
        } else {
          p2 =
            '<p data-testid="hidden">This paragraph was hidden. Click to show it again.</p>';
        }
      }

      rows.push([p1, p2]);
      i++;
      j++;
    }

    return rows;
  }
  return (
    <div>
      {mergeParagraphs(art.article1.content, art.article2.content).map(
        (c, i) => (
          <div data-testid="row" className="row" key={i} style={style}>
            <div
              data-testid={'article1-' + i}
              className="column"
              style={styleCol}
              onClick={(e) => handleClick(e, 'article1', i)}
              dangerouslySetInnerHTML={createMarkup(c[0])}
            ></div>
            <div
              data-testid={'article2-' + i}
              className="column"
              style={styleCol}
              onClick={(e) => handleClick(e, 'article2', i)}
              dangerouslySetInnerHTML={createMarkup(c[1])}
            ></div>
          </div>
        )
      )}
    </div>
  );
}

function initParagraph(paragraphs: string[]): Paragraph[] {
  return paragraphs.map((p) => {
    return {
      artificial: false,
      content: p,
      visible: true,
    };
  });
}

function createMarkup(c: any) {
  return { __html: c };
}

export { Article };
