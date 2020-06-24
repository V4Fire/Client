Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

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
