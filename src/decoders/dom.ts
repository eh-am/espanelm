import { JSDOM } from 'jsdom';
import { Result } from 'true-myth';

export interface DOM {
  querySelector(q: string): null | Element;
}

export function DOMFromText(s: string): Result<DOM, { reason: string }> {
  try {
    return Result.ok(new JSDOMImpl(s));
  } catch (error) {
    return Result.err({ reason: error });
  }
}

// JSDOM does some runtime to guarantee
// it's running inside a class
// therefore we need this wrapper
class JSDOMImpl implements DOM {
  _dom: JSDOM;
  constructor(html: string) {
    this._dom = new JSDOM(html);
  }

  querySelector(q: string): Element | null {
    return this._dom.window.document.querySelector(q);
  }
}
