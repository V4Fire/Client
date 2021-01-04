Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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
