Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.3.4 (2021-09-06)

#### :bug: Bug Fix

* Now `fatHTML` can be provided as a boolean

## v3.3.0 (2021-08-12)

#### :rocket: New Feature

* Added `webpack.stats`
* Added providing of default parameters

## v3.2.1 (2021-08-05)

#### :bug: Bug Fix

* Fixed normalizing of `--public-path`

## v3.2.0 (2021-08-05)

#### :rocket: New Feature

* Added a new parameter `--inline-initial`

## v3.0.0-rc.173 (2021-04-09)

#### :boom: Breaking Change

* Now `csp.nonceStore` is a function

#### :rocket: New Feature

* Added a new parameter `componentDependencies`

#### :bug: Bug Fix

* Now `csp.nonceStore` doesn't affect the project hash when `csp.none` is not specified

## v3.0.0-rc.137 (2021-02-04)

#### :rocket: New Feature

* Added a new parameter `--fat-html`

#### :bug: Bug fix

* Used `nanoid` to generate `nonceStore`

## v3.0.0-rc.136 (2021-02-02)

#### :rocket: New Feature

* Added a new parameter `build.demoPage`

## v3.0.0-rc.115 (2020-12-23)

#### :rocket: New Feature

* Improved CSP support. Added the `postProcessor` mode.

## v3.0.0-rc.113 (2020-12-18)

#### :rocket: New Feature

* Added `cssMinimizer`

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Removed `build.fast`
* Removed `webpack.buildCache`
* Removed `webpack.cacheDir`
* Removed `uglify`
* Now `webpack.devtool` is a function
* Moved `webpack.dataURILimit` to `webpack.optimize.dataURILimit`

#### :boom: New Feature

* Added `webpack.mode`
* Added `webpack.cacheType`
* Added `webpack.optimize.minChunkSize`
* Added `webpack.optimize.splitChunks`
* Added `style`
* Added `miniCssExtractPlugin`
* Added `terser`

## v3.0.0-rc.67 (2020-09-22)

#### :boom: Breaking Change

* Now `runtime.debug` is always `false` by default
* Now `webpack.buildCache` is always `false` by default

## v3.0.0-rc.41 (2020-07-29)

#### :boom: Breaking Change

* Removed redundant parameters from `snakeskin`

#### :rocket: New Feature

* Added `csp`

## v3.0.0-rc.36 (2020-07-13)

#### :rocket: New Feature

* Added the `worker` option

#### :house: Internal

* Refactoring
