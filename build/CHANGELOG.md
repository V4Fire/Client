Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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

* Added `stylus` plugins to generate URL-s `build/stylus/url`:
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
