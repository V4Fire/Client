# build/gulp

This module provides a bunch of files with Gulp tasks. Notice, each file in the directory exposes a function that registers some Gulp tasks. You should include these files within your `gulpfile.js`.

__gulpfile.js__

```js
require('config');

/**
 * Initializes the specified gulp instance
 * @param gulp
 */
module.exports = function initGulp(gulp = require('gulp')) {
  // Include Gulp tasks from the parent layer
  include('@super/gulpfile', __dirname)(gulp);

  include('build/gulp/static')(gulp);
  include('build/gulp/build')(gulp);
  include('build/gulp/test')(gulp);

  globalThis.callGulp(module);
};

module.exports();
```
