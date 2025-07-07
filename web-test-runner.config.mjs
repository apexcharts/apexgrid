import { fileURLToPath } from 'node:url';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const filteredLogs = ['in dev mode'];

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: ['test/**/*.test.ts'],

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  coverageConfig: {
    exclude: ['node_modules/**/*', '**/styles/**', 'test/**']
  },

  /** Browsers to run tests on */
  browsers: [playwrightLauncher({ product: 'chromium', headless: true })],

  testFramework: {
    config: {
      timeout: 4000,
    },
  },

  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
  ],

  // See documentation for all available options
});
