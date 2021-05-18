import { render, screen } from '@testing-library/react';
import { Article } from './article';

describe('Article', () => {
  it('works', () => {
    const article1 = {
      title: 'title of article 1',
      content: ['<p>p1 article1<p>', '<p>p2 article1<p>', '<p>p3 article1<p>'],
    };

    const article2 = {
      title: 'title of article 2',
      content: ['<p>p1 article2<p>', '<p>p2 article2<p>'],
    };

    render(<Article article1={article1} article2={article2} />);

    const rows = screen.getAllByTestId('row');
    const biggestArticleSize = Math.max(
      article1.content.length,
      article2.content.length
    );

    // number of rows is the same as the biggest article
    expect(rows).toHaveLength(biggestArticleSize);

    // All paragraphs have been rendered
    expect(screen.getAllByTestId(/article1-/)).toHaveLength(biggestArticleSize);
    expect(screen.getAllByTestId(/article2-/)).toHaveLength(biggestArticleSize);
  });

  describe('hiding paragraph', () => {
    fit('works', () => {
      const article1 = {
        title: 'title of article 1',
        content: ['<p>p1 article1<p>'],
      };

      const article2 = {
        title: 'title of article 2',
        content: ['<p>p1 article2<p>'],
      };

      render(<Article article1={article1} article2={article2} />);

      let rows = screen.getAllByTestId('row');
      const biggestArticleSize = Math.max(
        article1.content.length,
        article2.content.length
      );

      // Sanity test
      // number of rows is the same as the biggest article
      expect(rows).toHaveLength(biggestArticleSize);
      expect(screen.queryAllByTestId('hidden')).toHaveLength(0);

      // after hiding an article
      screen.getByTestId('show-hide-button-article1-0').click();

      // the total number of rows should be n + 1
      // since that paragraph was moved to its own
      // hidden row
      rows = screen.getAllByTestId('row');
      expect(rows).toHaveLength(biggestArticleSize + 1);
      expect(screen.getAllByTestId('hidden')).toHaveLength(1);

      // unhide
      screen.getByTestId('show-hide-button-article1-0').click();

      // the additional row should've gone away
      rows = screen.getAllByTestId('row');
      expect(rows).toHaveLength(biggestArticleSize);
      expect(screen.queryAllByTestId('hidden')).toHaveLength(0);
    });
  });
});
