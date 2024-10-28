Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.138.dsl-speedup (2024-10-01)

#### :house: Internal

* Apply the `symbol-generator-loader` consistently to optimize Runtime performance

## v4.0.0-beta.125 (2024-08-12)

#### :bug: Bug Fix

* Fixed the dynamic component import transformer for the SSR build `monic`

## v4.0.0-beta.95 (2024-05-06)

#### :house: Internal

* Add `REGION` to webpack globals

## 4.0.0-beta.75 (2024-03-22)

#### :house: Internal

* Removed the restriction on loading styles if a template is loaded

## v3.24.1 (2022-08-19)

#### :rocket: New Feature

* Refactor of the statoscope config build script `build-statoscope`

## v3.24.0 (2022-08-12)

#### :rocket: New Feature

* Added a new script to build the statoscope config file `build-statoscope`

## v3.15.5 (2021-01-24)

#### :bug: Bug Fix

* Fixed an issue with test command `test:component:build` did not wait for the completion of the project build operation

## v3.10.0 (2021-11-16)

#### :rocket: New Feature

* `webpack`:
  * Added a new Webpack plugin `SimpleProgressWebpackPlugin` to view the current build status
  * Deleted a Webpack plugin `statoscopePlugin`

* Added a gulp task to transform `stats` reports from Webpack `gulp`

## v3.6.0 (2021-10-14)

#### :rocket: New Feature

* Added a new parameter `componentLockPrefix`

## v3.4.0 (2021-09-09)

#### :boom: Breaking Change

* Most of webpack config files moved to the `webpack` folder
* Renamed the `replacers` folder to `monic`

#### :house: Internal

* Review modules

## v3.3.3 (2021-08-13)

#### :bug: Bug Fix

* Fixed providing of a dynamic public path to styles

## v3.3.2 (2021-08-12)

#### :bug: Bug Fix

* Testing the particular color to detect if a style is already loaded

## v3.3.1 (2021-08-12)

#### :bug: Bug Fix

* Provide magic comments to dynamic imports

## v3.3.0 (2021-08-12)

#### :rocket: New Feature

* Added `stats.webpack`
* Added providing of default parameters
* Now `webpack.fatHTML` has different modes

#### :bug: Bug Fix

* Added support for magic comments within imports
* Added support for the --json parameter
* Hid invalid build warnings

## v3.0.0-rc.215 (2021-07-25)

#### :bug: Bug Fix

* Restored support of favicons

## v3.0.0-rc.211 (2021-07-21)

#### :rocket: New Feature

* Added new tag name filters `:section` and `:-section` `snakeskin`

## v3.0.0-rc.186 (2021-05-13)

#### :bug: Bug Fix

* Fixed transforming of smart components `snakeskin`

## v3.0.0-rc.177 (2021-04-14)

#### :bug: Bug Fix

* Fixed the loading order of styles

## v3.0.0-rc.174 (2021-04-09)

#### :bug: Bug Fix

* Fixed the project building with `parallel-webpack`

## v3.0.0-rc.173 (2021-04-09)

#### :rocket: New Feature

* Added aliases `mem` and `fs` for `--cache-type`

## v3.0.0-rc.171 (2021-03-27)

#### :bug: Bug Fix

* Fixed a race condition during attaching of component dependencies

## v3.0.0-rc.166 (2021-03-24)

#### :bug: Bug Fix

* Fixed generation of dynamic imports for ES5/3

## v3.0.0-rc.165 (2021-03-23)

#### :bug: Bug Fix

* Fixed providing of `webpack.target`

## v3.0.0-rc.163 (2021-03-19)

#### :rocket: New Feature

* Added `target.webpack`

## v3.0.0-rc.160 (2021-03-17)

#### :bug: Bug Fix

* Fixed a bug when the project building never stopped

## v3.0.0-rc.159 (2021-03-15)

#### :bug: Bug Fix

* Fixed a bug when the `noGlobal` breaks on `'foo'?.dasherize()`

## v3.0.0-rc.157 (2021-03-10)

#### :rocket: New Feature

* Added the support of external CSS libraries to build within entries

## v3.0.0-rc.143 (2021-02-11)

#### :rocket: New Feature

* Added `stylus` plugins to generate URLs `build/stylus/url`:
  * `toQueryString`
  * `createURL`

## v3.0.0-rc.140 (2021-02-05)

#### :rocket: New Feature

* Added a new global constant `MODULE`

## v3.0.0-rc.137 (2021-02-04)

#### :rocket: New Feature

* Added a new option `--only-run:boolean` for `npx gulp test:components`.
  It allows run all test cases without the building stage.

#### :bug: Bug Fix

* Fixed the running of parallel tests when `portfinder` was returning the same port for different processes
* Fixed minifying of dynamic styles
* Fixed dynamic imports with `fatHTML`

## v3.0.0-rc.136 (2021-02-02)

#### :rocket: New Feature

* Added logging of dependencies

#### :bug: Bug Fix

* Fixed inlining with `fatHTML`

## v3.0.0-rc.126 (2021-01-26)

#### :bug: Bug Fix

* Fixed the `fatHTML` mode

## v3.0.0-rc.123 (2021-01-15)

#### :rocket: New Feature

* Added `--device` for `component:test`

## v3.0.0-rc.112 (2020-12-18)

#### :rocket: New Feature

* Added `snapshot.webpack`

#### :bug: Bug Fix

* Fixed `dynamic-component-import`

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Renamed `entries.webpack` to `graph.webpack`
* Renamed `build.webpack` to `helpers.webpack`
* Now `output.webpack` exports a function

#### :rocket: New Feature

* Added support of dynamic imports
* Added `isLayerCoreDep`
* Added `entry.webpack`
* Added `watch-options.webpack`
* Added `other.webpack`

## v3.0.0-rc.90 (2020-10-22)

#### :nail_care: Polish

* Improved output `test.gulp`

## v3.0.0-rc.85 (2020-10-09)

#### :rocket: New Feature

* Provided a graph of components to `globals.webpack`

## v3.0.0-rc.76 (2020-10-07)

#### :boom: Breaking Change

* Renamed `isWorker` to `isStandalone` `helpers`

#### :rocket: New Feature

* Added support of a new postfix `.standalone` `entries.webpack`

## v3.0.0-rc.73 (2020-10-02)

#### :house: Internal

* Added the `runtime-render` flag for tests `test.gulp`

## v3.0.0-rc.71 (2020-10-01)

#### :house: Internal

* Set `DEFAULT_TIMEOUT_INTERVAL = (10).seconds()` `test.gulp`

## v3.0.0-rc.67 (2020-09-22)

#### :bug: Bug Fix

* Downgrade to `postcss@7`

## v3.0.0-rc.66 (2020-09-22)

#### :bug: Bug Fix

* Fixed providing of `Autoprefixer`

## v3.0.0-rc.58 (2020-08-07)

#### :house: Internal

* Added `.ico` files to build `module.webpack/img`

## v3.0.0-rc.48 (2020-08-02)

#### :rocket: New Feature

* Added `isWorker` to helpers

## v3.0.0-rc.41 (2020-07-29)

#### :boom: Breaking Change

* Removed `snakeskin/filters/csp`
* Renamed `dependencies` -> `entryPoints` `module.webpack/snakeskin`
* Renamed `replacers/raw-import` -> `replacers/include`
* Changed a pattern from `requireMonic(...)` to `include('...');` `replacers/include`

## v3.0.0-rc.36 (2020-07-13)

#### :rocket: New Feature

* Improved support of workers

#### :house: Internal

* Improved logic `entries.webpack.js`
* Fixed ESLint warnings
* Refactoring
