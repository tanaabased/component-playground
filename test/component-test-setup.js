import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, vi } from 'vitest';

const rectangle = {
  bottom: 20,
  height: 20,
  left: 0,
  right: 200,
  top: 0,
  width: 200,
  x: 0,
  y: 0,
  toJSON() {
    return this;
  },
};

Object.defineProperties(Range.prototype, {
  getBoundingClientRect: {
    configurable: true,
    value: () => rectangle,
  },
  getClientRects: {
    configurable: true,
    value: () => ({
      0: rectangle,
      item: (index) => (index === 0 ? rectangle : null),
      length: 1,
      [Symbol.iterator]: function* iterator() {
        yield rectangle;
      },
    }),
  },
});

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => rectangle,
});

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

enableAutoUnmount(afterEach);

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
  vi.useRealTimers();
});
