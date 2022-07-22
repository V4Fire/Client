Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.23.8 (2022-07-22)

#### :bug: Bug Fix

* Fixed opening a link in new tab with CMD meta key on macOS

## v3.5.2 (2021-10-06)

#### :bug: Bug Fix

* Fixed providing of meta parameters via transitions

## v3.5.0 (2021-09-16)

#### :house: Internal

* Added new tests for the `in-memory` engine
* Call `updateCurrentRoute` only `basePath` prop changes but not the property itself

## v3.0.0-rc.195 (2021-05-28)

#### :house: Internal

* Improved restoring of scroll

## v3.0.0-rc.192 (2021-05-27)

#### :bug: Bug Fix

* Fixed the scroll restoring after a transition

## v3.0.0-rc.182 (2021-04-28)

#### :house: Internal

* Extracted `compileStaticRoutes` from `bRouter` to `core/router`

## v3.0.0-rc.181 (2021-04-20)

#### :house: Internal

* Extracted some helpers and interfaces from `bRouter` to `core/router`

## v3.0.0-rc.128 (2021-01-27)

#### :bug: Bug Fix

* Fixed providing of URL within `route`

## v3.0.0-rc.123 (2021-01-15)

#### :boom: Breaking Change

* Changed an interface and behavior of `initRemoteData`

#### :rocket: New Feature

* Added support of interpolation of a data provider response

#### :memo: Documentation

* Improved documentation

## v3.0.0-rc.118 (2020-12-24)

#### :bug: Bug Fix

* Trim href-s before go

## v3.0.0-rc.113 (2020-12-18)

#### :bug: Bug Fix

* Fixed handling of `javascript:` links

## v3.0.0-rc.110 (2020-12-16)

#### :rocket: New Feature

* Added `interceptLinks`

## v3.0.0-rc.36 (2020-07-13)

#### :bug: Bug Fix

* Fixed providing of parameters `getRoute`

#### :house: Internal

* Fixed ESLint warnings

## v3.0.0-rc.29 (2020-06-09)

#### :bug: Bug Fix

* Fixed deprecated API

## v3.0.0-rc.27 (2020-06-08)

#### :boom: Breaking Change

* Removed click handler
* Removed `scrollTo`
* Review legacy logic with providing of root parameters to the router

#### :rocket: New Feature

* Added `updateRoutes`
* Added support to watch route query
* Marked `routes` as public
* Marked `basePath` as system field

#### :bug: Bug Fix

* Fixed `external`, `alias` and `redirect` logic

#### :house: Internal

* Added `README.md`
* Added tests & refactoring
* Renamed a group of properties:
  * `page` -> `route`
  * `pageProp` -> `initialRoute`
  * `pages` -> `routes`
  * `pagesProp` -> `routesProp`
  * `getPageOpts` -> `getRoute`
  * `setPage` -> `emitTransition`
