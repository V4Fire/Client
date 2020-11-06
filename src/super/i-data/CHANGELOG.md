Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.96 ()

#### :rocket: New Feature

* Implemented new API from `iProgress`

#### :house: Internal

* Refactoring

#### :nail_care: Polish

* Improved documentation

## v3.0.0-rc.72 (2020-10-01)

#### :boom: Breaking Change

* Renamed `dataProviderEmitter` to `dataEmitter`
* Deprecated `requestFilter`
* Deprecated `dropRequestCache`

#### :rocket: New Feature

* Added `defaultRequestFilter`
* Added `dropDataCache`

#### :nail_care: Polish

* Improved doc

## v3.0.0-rc.61 (2020-09-04)

#### :bug: Bug Fix

* [Fixed wrong refactoring in `rc48`](https://github.com/V4Fire/Client/pull/326)

## v3.0.0-rc.56 (2020-08-06)

#### :bug: Bug Fix

* Fixed `initLoad` error handling

## v3.0.0-rc.55 (2020-08-05)

#### :bug: Bug Fix

* Fixed an issue with `requestFilter` after refactoring
* Fixed an issue with `initLoad` after refactoring

## v3.0.0-rc.48 (2020-08-02)

#### :boom: Breaking Change

* Changed the signature of `getDefaultRequestParams`

#### :rocket: New Feature

* Added `initLoadStart` event

#### :bug: Bug Fix

* Fixed an issue with `initLoad` may be called twice

#### :house: Internal

* Fixed ESLint warnings
