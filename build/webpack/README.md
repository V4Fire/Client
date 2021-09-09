# build/webpack

This module provides options to configure Webpack. Each file in the folder has a name that matches with a Webpack option. For instance, `/output.js` matches with `Webpack.output` or `/watch-options.js` matches with `Webpack.watchOptions.js`. Notice that some modules return not a Webpack config object but a function or another kind of object structure because it is designed to be easy to override and modify with child application layers.

All loaders are placed within the `loaders` sub-folder, and all plugins are placed within `plugins`.
The module also exposes some custom modules. These modules are placed within the `custom` sub-folder.

## Custom modules

### preconfig

This module provides a promise that will be awaited before run a Webpack process. You can override it with your app layer and place within to it some pre-config operations.

### options

This module provides a function that should return an object with the rest Webpack options, that don't have their own files.

## Webpack config

With V4Fire projects, Webpack main config exposes a promise that returns an array of config tasks. Some tasks build TypeScript/JavaScript files. Some build style files or generates HTML files. This approach helps easily organize different ways to build an application, like fatHTML (all files, images, fonts, etc., are inlined within one HTML file).
