import { useState } from 'react';
import { nanoid } from 'nanoid';

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

  function handleClick(e: any, name: keyof typeof art, index: any) {
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

  return (
    <div>
      {mergeParagraphs(art.article1.content, art.article2.content).map(
        (c, i) => (
          <div data-testid="row" className="row" key={c.key} style={style}>
            <div
              data-testid={'article1-' + i}
              className="column"
              style={styleCol}
              onClick={(e) => handleClick(e, 'article1', i)}
              dangerouslySetInnerHTML={createMarkup(c.p1)}
            ></div>
            <div
              data-testid={'article2-' + i}
              className="column"
              style={styleCol}
              onClick={(e) => handleClick(e, 'article2', i)}
              dangerouslySetInnerHTML={createMarkup(c.p2)}
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
      id: nanoid(),
      visible: true,
    };
  });
}

function createMarkup(c: any) {
  return { __html: c };
}

// mergeParagraph merges 2 list of paragraphs into a list of tuples
// so that they can be easily renderer
function mergeParagraphs(col1: Paragraph[], col2: Paragraph[]) {
  const rows: { p1: string; p2: string; key: string }[] = [];

  let i = 0;
  let j = 0;
  // by default, don't use a natural key
  let useNaturalKey = false;

  while (i < col1.length || j < col2.length) {
    let p1 = '';
    let p2 = '';

    const c1 = col1[i];
    if (c1 && !c1.artificial && c1.content) {
      if (c1.visible) {
        p1 = c1.content;
        // since we know the content is (probably) unique
        // use the content itself as the key
        useNaturalKey = true;
      } else {
        p1 =
          '<p data-testid="hidden">This paragraph was hidden. Click to show it again.</p>';
      }
    }

    const c2 = col2[j];
    if (c2 && !c2.artificial && c2.content) {
      if (c2.visible) {
        p2 = c2.content;
        // since we know the content is (probably) unique
        // use the content itself as the key
        useNaturalKey = true;
      } else {
        p2 =
          '<p data-testid="hidden">This paragraph was hidden. Click to show it again.</p>';
      }
    }

    const key = useNaturalKey ? p1 + p2 : nanoid();

    rows.push({
      key,
      p1,
      p2,
    });

    i++;
    j++;
  }

  return rows;
}

export { Article };
