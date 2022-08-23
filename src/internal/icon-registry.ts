import { registerIconFromText } from 'igniteui-webcomponents';

const internalIcons: Record<string, string> = {
  'arrow-upward':
    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-downward" role="img" viewBox="0 0 45 45"><path d="M22.5 40V13.7L10.1 26.1 8 24 24 8l16 16-2.1 2.1-12.4-12.4V40Z"/></svg>',
  'arrow-downward':
    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-downward" role="img" viewBox="0 0 45 45"><path fill="currentColor" d="M24 40 8 24l2.1-2.1 12.4 12.4V8h3v26.3l12.4-12.4L40 24Z"/></svg>',
};

export function registerGridIcons() {
  for (const [name, svg] of Object.entries(internalIcons)) {
    registerIconFromText(name, svg, 'internal');
  }
}
