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

## (2020-05-16)

#### :boom: Breaking Change

* Removed click handler

#### :rocket: New Feature

* Added support to watch route query

#### :bug: Bug Fix

* Fixed `external`, `alias` and `redirect` logic

#### :house: Internal

* Refactoring
* Renamed a group of properties:
  * `page` -> `route`
  * `pageProp` -> `activeRoute`
  * `pages` -> `routes`
  * `pagesProp` -> `routesProp`
  * `getPageOpts` -> `getRoute`
  * `setPage` -> `emitTransition`
