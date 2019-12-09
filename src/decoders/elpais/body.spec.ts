import { loadFixtureOrFail } from '../../../test/helpers';
import { DOM, DOMFromText } from '../dom';
import { decodeBody } from './body';
import { Result } from 'true-myth';

describe('ElPais Body Decoder', () => {
  const domFromFixture = async (f: string): Promise<DOM> => {
    const fixture = await loadFixtureOrFail(f);

    return Result.unsafelyUnwrap(DOMFromText(fixture));
  };

  const unwrappedBody = (dom: DOM): string[] =>
    decodeBody(dom).unsafelyUnwrap();

  it('should work with method 1', async () => {
    const dom = await domFromFixture('article.html');

    expect(unwrappedBody(dom)).toMatchSnapshot();
  });

  it('should work with method 2', async () => {
    const dom = await domFromFixture('articles/1565345150_208544');

    expect(unwrappedBody(dom)).toMatchSnapshot();
  });

  it('should return Nothing if its unable to decode', async () => {
    const dom = DOMFromText('').unsafelyUnwrap();
    const body = decodeBody(dom);
    expect(body.isNothing()).toBe(true);
  });
});
