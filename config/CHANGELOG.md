Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.123 (2024-08-09)

#### :bug: Bug Fix

* Fix the browserslist for correct CSS autoprefixer work

## v4.0.0-beta.33 (2023-10-18)

#### :rocket: New Feature

* Added new config option `webpack.externalizeInline`

## v4.0.0-beta.30 (2023-10-11)

#### :rocket: New Feature

* Added default values for `runtime` theme parameters
* Added a new option `module-parallelism` option, which sets the [`parallelism`](https://webpack.js.org/configuration/other-options/#parallelism) option for a webpack
* Added a new option `trace-build-times`, which enables the build time tracing

## v4.0.0-beta.20 (2023-09-13)

#### :rocket: New Feature

* Added `verbose` flag to `build` config
* Added `detectUserPreferences` parameter to `theme` config

## v4.0.0-beta.13 (2023-08-24)

#### :rocker: New Feature

* Added `managed-libs` option, which add specified libraries to `snapshot.managedPaths` and watches
them in webpack watch mode

## v3.39.0 (2023-03-07)

#### :rocket: New Feature

* Added new options `i18n`

## v3.26.0 (2022-08-26)

#### :boom: Breaking Change

* `build.demoPage` is a function now

## v3.20.0 (2022-04-25)

#### :boom: Breaking Change

* Removed all options associated with `worker-loader`

## v3.16.2 (2022-02-22)

#### :bug: Bug Fix

* Fixed an issue with the `nonceStore.result` field

## v3.16.0 (2022-02-09)

#### :rocket: New Feature

* [Added a new `build.mode` config variable](https://github.com/V4Fire/Client/issues/685)

## v3.11.1 (2021-11-22)

#### :house: Internal

* Added possibility to redefine Statoscope size and download time limit

## v3.10.0 (2021-11-16)

#### :rocket: New Feature

* Added a config for Statoscope

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

* Now `csp.nonceStore` does not affect the project hash when `csp.none` is not specified

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
