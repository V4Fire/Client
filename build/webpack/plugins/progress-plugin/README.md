# build/webpack/plugins/progress-plugin

This module provides a plugin to show webpack build progress.

## Options

The plugin can be customized via an App config.

__config/default.js__

```js
const
  config = require('@v4fire/client/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  webpack: {
    progress() {
      return {
        // To show progress will be used https://www.npmjs.com/package/cli-progress
        type: 'progressbar',

        // Extra options for the used progress engine
        opts: {
          clearOnComplete: true,
          stopOnComplete: true,
          hideCursor: null
        }
      };
    },
  }
});
```

### type

This option defines which engine to show progress is used.

* `println` - a simple println based engine. The output will be look like:

  ```
  # standalone: 93%
  # standalone: 93%
  # standalone: 94%
  # standalone: 94%
  # standalone: 95%
  # runtime:    10%
  # runtime:    15%
  # runtime:    20%
  # runtime:    30%
  # runtime:    40%
  ```

* `progressbar` - an engine that used the `cli-progress` library to show progress. The output will be look like:

  ```
  # standalone █████████████████████░░░░░░░░░░░░░░░░░░░ 50%
  # runtime    ████████████████████████████████████████ 100%
  ```
