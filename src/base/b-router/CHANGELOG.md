Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.?.? (2023-??-??)

#### :boom: Breaking Change

* Merging of parameters when navigating to a route with the same name as the current one has been removed

#### :bug: Bug Fix

* Fixed alias priority when resolve path parameters

## v3.52.0 (2023-07-19)

#### :rocket: New Feature

* Added new event `hrefTransition` to `b-router` to provide the capability to prevent router transition upon link click

## v3.51.1 (2023-06-27)

#### :bug: Bug Fix

* Handle unsuitable `pathParams` values in the `fillRouteParams` function

## v3.51.0 (2023-06-27)

#### :rocket: New Feature

* Added support for `mailto:` and `tel:` href-s

## v3.47.1 (2023-05-18)

#### :bug: Bug Fix

* Replace `undefined` values in `route.params` by an alias or query param, if necessary

## v3.44.3 (2023-03-30)

#### :bug: Bug Fix

* Overriding original parameter by alias in route

## v3.44.1 (2023-03-28)

#### :rocket: New Feature

* Added possibility to specify aliases for dynamic parameters in path

## v3.31.0 (2022-12-06)

#### :rocket: New Feature

* Added possibility to disable specific link interception

## v3.30.2 (2022-11-17)

#### :bug: Bug Fix

* Fixed soft transitions with array parameters

## v3.24.2 (2022-08-19)

#### :house: Internal

* Provided unsafe access to the `engine` field

## v3.23.8 (2022-07-22)

#### :bug: Bug Fix

* Fixed opening a link in a new tab with the CMD meta key on macOS

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
