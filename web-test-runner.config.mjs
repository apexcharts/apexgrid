/* process.env.npm_lifecycle_event, process.env.npm_lifecycle_script, process.env.OUTDIR; */

import { playwrightLauncher } from '@web/test-runner-playwright';
import { defaultReporter } from '@web/test-runner';
import { mochaStyleReporter } from '@blockquote/test-runner-mocha-style-reporter';

const filteredLogs = ['in dev mode'];
const outDir = process.env.OUTDIR || '.';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: [`${outDir}/test/**/*.test.js`, `!${outDir}/test/utils/**/*`],

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Browsers to run tests on */
  browsers: [playwrightLauncher({ product: 'chromium' })],

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  reporters: [defaultReporter(), mochaStyleReporter()],

  coverageConfig: {
    report: true,
    reportDir: `${outDir}/test/coverage`,
    threshold: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  testFramework: {
    config: {
      ui: 'tdd',
      timeout: 4000,
    },
  },

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  // See documentation for all available options
});
