Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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
