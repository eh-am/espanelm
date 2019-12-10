import { loadFixtureOrFail } from '../../../test/helpers';
import { DOM, DOMFromText } from '../dom';
import { decodeTitle } from './title';
import { Result } from 'true-myth';

describe('ElPais Title Decoder', () => {
  const domFromFixture = async (f: string): Promise<DOM> => {
    const fixture = await loadFixtureOrFail(f);

    return Result.unsafelyUnwrap(DOMFromText(fixture));
  };

  const unwrappedTitle = (dom: DOM): string =>
    decodeTitle(dom).unsafelyUnwrap();

  it('should work with method 1', async () => {
    const dom = await domFromFixture('article.html');

    expect(unwrappedTitle(dom)).toBe(
      'O abraço entre duas crianças que comoveu as redes'
    );
  });

  it('should work with method 2', async () => {
    const dom = await domFromFixture('articles/1565345150_208544');

    expect(unwrappedTitle(dom)).toBe(
      'Olimpio Guajajara, o guardião de três São Paulos de floresta no Maranhão'
    );
  });

  it('should return Nothing if its unable to decode', async () => {
    const dom = DOMFromText('').unsafelyUnwrap();
    const title = decodeTitle(dom);
    expect(title.isNothing()).toBe(true);
  });
});
