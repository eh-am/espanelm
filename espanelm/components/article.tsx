import { Fragment, useState } from 'react';
import { nanoid } from 'nanoid';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

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

  const styleTitle = {
    flex: '50%',
  };

  return (
    <div className="column bg-white shadow-lg my-8 mx-2">
      <div className="row flex ">
        <h1 style={styleTitle} className="text-xl font-bold mx-2 p-2">
          {art.article1.title}
        </h1>
        <h1 style={styleTitle} className="text-xl font-bold mx-2 p-2">
          {art.article2.title}
        </h1>
      </div>
      <hr />
      {mergeParagraphs(art.article1.content, art.article2.content).map(
        (c, i) => (
          <Fragment key={c.key}>
            <div data-testid="row" className="row flex">
              <Paragraph
                handleClick={handleClick}
                i={i}
                name="article1"
                p={c.p1.content}
                artificial={c.p1.artificial}
                visible={c.p1.artificial ? false : c.p1.visible}
              ></Paragraph>
              <Paragraph
                handleClick={handleClick}
                i={i}
                name="article2"
                artificial={c.p2.artificial}
                visible={c.p2.artificial ? false : c.p2.visible}
                p={c.p2.content}
              ></Paragraph>
            </div>
            <hr />
          </Fragment>
        )
      )}
    </div>
  );
}

function Paragraph(props: any) {
  const style = {
    flex: '50%',
  };

  return (
    <div className="column mx-2 px-2" style={style}>
      <div>
        {!props.artificial && (
          <button
            data-testid={`show-hide-button-` + props.name + `-` + props.i}
            className="px-2 mt-4 border rounded border-lime-500"
            onClick={(e) => props.handleClick(e, props.name, props.i)}
          >
            {props.visible ? (
              <>
                <MdVisibilityOff className="inline-block"></MdVisibilityOff>
                <span className="ml-2 text-xs">Hide</span>
              </>
            ) : (
              <>
                <MdVisibility className="inline-block"></MdVisibility>
                <span className="ml-2 text-xs">Show</span>
              </>
            )}
          </button>
        )}
      </div>
      <div
        className="text-justify py-4"
        data-testid={props.name + '-' + props.i}
        dangerouslySetInnerHTML={createMarkup(props.p)}
      ></div>
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
  //  const rows: {
  //    p1: {
  //      content: string;
  //      artificial: boolean;
  //      visible: boolean;
  //    };
  //    p2: {
  //      content: string;
  //      artificial: boolean;
  //      visible: boolean;
  //    };
  //    key: string;
  //  }[] = [];
  //
  const rows: {
    p1: Paragraph & { content: string };
    p2: Paragraph & { content: string };
    key: string;
  }[] = [];
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
      p1: {
        ...c1,
        content: p1,
      },
      p2: {
        ...c2,
        content: p2,
      },
    });

    i++;
    j++;
  }

  return rows;
}

export { Article };
