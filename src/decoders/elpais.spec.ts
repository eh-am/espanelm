import { loadFixtureOrFail } from '../../test/helpers';
import { DOM, DOMFromText } from './dom';
import { decodeTitle } from './elpais';
import { Result } from 'true-myth';

fdescribe('ElPais Decoder', () => {
  const domFromFixture = async (f: string): Promise<DOM> => {
    const fixture = await loadFixtureOrFail(f);

    return Result.unsafelyUnwrap(DOMFromText(fixture));
  };

  it('should work with method 1', async () => {
    const dom = await domFromFixture('article.html');

    expect(decodeTitle(dom)).toBe(
      'O abraço entre duas crianças que comoveu as redes'
    );
  });

  it('should work with method 2', async () => {
    const dom = await domFromFixture('articles/1565345150_208544');

    expect(decodeTitle(dom)).toBe(
      'Olimpio Guajajara, o guardião de três São Paulos de floresta no Maranhão'
    );
  });
});
