import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://justinkong.app',
  output: 'static',
  // One page with a small stylesheet: inlining it removes the render-blocking request.
  build: { inlineStylesheets: 'always' },
});
