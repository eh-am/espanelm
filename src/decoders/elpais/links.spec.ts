import { loadFixtureOrFail } from '../../../test/helpers';
import { DOM, DOMFromText } from '../dom';
import { PageLinks, decodeLinks } from './links';
import { Result } from 'true-myth';

fdescribe('ElPais Links Decoder', () => {
  const domFromFixture = async (f: string): Promise<DOM> => {
    const fixture = await loadFixtureOrFail(f);

    return Result.unsafelyUnwrap(DOMFromText(fixture));
  };

  const unwrapped = (dom: DOM): PageLinks => decodeLinks(dom).unsafelyUnwrap();

  it('should work', async () => {
    const dom = await domFromFixture('article.html');

    expect(unwrapped(dom)).toMatchSnapshot();
  });

  it('should work with method 2', async () => {
    const dom = await domFromFixture('articles_es/1575633540_632181');

    expect(unwrapped(dom)).toMatchSnapshot();
  });

  it('should return Nothing if its unable to decode', async () => {
    const dom = DOMFromText('').unsafelyUnwrap();
    const body = decodeLinks(dom);
    expect(body.isNothing()).toBe(true);
  });
});
