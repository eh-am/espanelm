import { loadFixtureOrFail } from '../../../../test/helpers';
import { DOM, DOMFromText } from '../../../decoders/dom';
import { decodeLang } from './lang';
import { Result } from 'true-myth';

describe('ElPais Lang Decoder', () => {
  const domFromFixture = async (f: string): Promise<DOM> => {
    const fixture = await loadFixtureOrFail(f);

    return Result.unsafelyUnwrap(DOMFromText(fixture));
  };

  const unwrapped = (dom: DOM): string => decodeLang(dom).unsafelyUnwrap();

  it('should decode pt-br articles', async () => {
    let dom = await domFromFixture('article.html');
    expect(unwrapped(dom)).toBe('pt-br');

    dom = await domFromFixture('articles/1565345150_208544');
    expect(unwrapped(dom)).toBe('pt-br');
  });

  it('should decode es articles', async () => {
    let dom = await domFromFixture('article.html');
    expect(unwrapped(dom)).toBe('pt-br');

    dom = await domFromFixture('articles_es/1572447110_116209');
    expect(unwrapped(dom)).toBe('es');
  });

  it('should return Nothing if its unable to decode', async () => {
    const dom = DOMFromText('').unsafelyUnwrap();
    const title = decodeLang(dom);
    expect(title.isNothing()).toBe(true);
  });
});
