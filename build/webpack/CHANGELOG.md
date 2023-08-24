Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]


## v4.??.?? (2023-??-??)

#### :rocket: New Feature

* Added a new plugin `invalidate-external-cache`

## v3.42.0 (2023-03-14)

#### :bug: Bug Fix

* Fixed replace pattern for `i18n` webpack plugin

## v3.39.0 (2023-03-07)

#### :rocket: New Feature

* Added a new plugin `i18n-plugin`

## v3.37.0 (2023-02-20)

#### :bug: Bug Fix

* Downgrade `css-loader` version for fix svg bundling

## v3.36.0 (2023-02-14)

#### :house: Internal

* Replaced `fast-css-loader` with `css-loader`

## v3.34.1 (2023-01-31)

#### :house: Internal

* Added the ability to specify webpack aliases from the config

## v3.34.0 (2023-01-30)

#### :boom: Breaking Change

* [Now `commonjs` module will not be installed for typescript processing into `fathtml` mode, instead `module` from tsconfig will be taken by `default`](https://github.com/V4Fire/Client/discussions/773)

#### :bug: Bug Fix

* Fixed an issue with building project as `fat html` with `ES20xx` module `build/webpack/plugins`

## v3.27.0 (2022-08-30)

#### :rocket: New Feature

* Added favicons folder path in globla `PATH` variable `build/webpack/plugins`

## v3.24.0 (2022-08-12)

#### :rocket: New Feature

* Added `statoscope-webpack-plugin`

## v3.20.0 (2022-04-25)

#### :boom: Breaking Change

* Removed `worker-loader`

## v3.15.0 (2021-12-16)

#### :bug: Bug Fix

* Fixed issues with symlinks

## v3.15.0 (2021-12-16)

#### :boom: Breaking Change

* Removed `typograf-loader`

#### :house: Internal

* Don't apply `symbol-generator-loader` for ES6+

## v3.7.0 (2021-10-25)

#### :rocket: New Feature

* Added a new `?inline` parameter for assets loaders

## v3.4.0 (2021-09-09)

#### :boom: Breaking Change

* Most of webpack config files moved to the `webpack` folder

#### :house: Internal

* Review modules
