Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.105 (2020-12-09)

#### :rocket: New Feature

* Added the default value to `iterate/slice`

#### :bug: Bug Fix

* Fixed a bug with redundant `v-for` invokes
* Fixed a bug when `iterate` takes the rejected promise
* Fixed the global blocking of rendering when using a filter that returns a promise

## v3.0.0-rc.100 (2020-11-17)

#### :rocket: New Feature

* Added support of filters with promises

## v3.0.0-rc.68 (2020-09-23)

#### :boom: Breaking Change

* Renamed `TaskI.list` -> `TaskI.iterable`
* Renamed `TaskOptions` -> `TaskParams`

#### :bug: Bug Fix

* Fixed rendering of arrays

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
