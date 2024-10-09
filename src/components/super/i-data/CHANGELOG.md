Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-10-??)

#### :bug: Bug Fix

* Fixed an issue with updating the `componentStatus` after destroying the component

## v4.0.0-beta.30 (2023-10-11)

#### :bug: Bug Fix

* Fixed data restoration of provider after hydration

## v4.0.0-beta.28 (2023-09-26)

#### :bug: Bug Fix

* Now, data for hydration is saved before applying converters

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Renamed `suspendRequests` to `suspendedRequests`
* Replaced `dp` with `dataProvider`

#### :rocket: New Feature

* Now any provider can be set using constructor or instance

## v3.18.3 (2022-04-01)

#### :bug: Bug Fix

* Fixed a bug when event data is provided as a promise

## v3.0.0-rc.197 (2021-06-07)

#### :boom: Breaking Change

* Removed initialization of `iProgress` modifier event listeners

## v3.0.0-rc.127 (2021-01-26)

#### :bug: Bug Fix

* Fixed `componentStatus` with flyweight components

## v3.0.0-rc.123 (2021-01-15)

#### :rocket: New Feature

* Implemented new API from `iProgress`

#### :memo: Documentation

* Improved documentation

#### :house: Internal

* Refactoring

## v3.0.0-rc.110 (2020-12-16)

#### :house: Internal

* Added prefetching for the dynamic dependencies

## v3.0.0-rc.97 (2020-11-11)

#### :bug: Bug Fix

* Marked `defaultRequestFilter` and `requestFilter` as optional

## v3.0.0-rc.96 (2020-11-10)

#### :rocket: New Feature

* Added `suspendRequests/unsuspendRequests/waitPermissionToRequest`

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
