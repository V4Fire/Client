Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-11-25)

#### :bug: Bug Fix

* Added the `default` getter to static compiled routes.
This is necessary to correctly compare the compiled route and the current route of the router.

## v4.0.0-beta.42 (2023-11-23)

#### :rocket: New Feature

* The `load` function now accepts the router context

## v4.0.0-beta.13 (2023-08-24)

#### :bug: Bug Fix

* A default `endsWith: "?"` parameter has been added to the route configuration to correctly parse route parameters when
  there are query parameters in the path

## v4.0.0-beta.9 (2023-07-23)

#### :bug: Bug Fix

* Fixed alias priority when resolve path parameters

## v3.50.0 (2023-06-16)

#### :rocket: New Feature

* Fill original route path parameters from URL of the route that redirects on it

## v3.44.3 (2023-03-30)

#### :bug: Bug Fix

* Overriding original parameter by alias in route

## v3.44.1 (2023-03-28)

#### :rocket: New Feature

* Added possibility to specify aliases for dynamic parameters in path

## v3.23.0 (2022-05-27)

#### :bug: Bug Fix

* Fixed a bug with the History API router engine when backing to the first history item doesn’t emit a popstate event in Safari if the script is running within an iframe `core/router/engines/browser-history`

## v3.5.0 (2021-09-16)

#### :boom: Breaking Change

* Renamed `browser.history` to `browser-history` `engines`

#### :rocket: New Feature

* Added a new router engine `in-memory`

## v3.0.0-rc.212 (2021-07-22)

#### :bug: Bug Fix

* Fixed an issue when passed route parameters ignored if defined the `alias` property

## v3.0.0-rc.199 (2021-06-16)

#### :bug: Bug Fix

* [Get rid of a redundant router transition when restoring the page from BFCache in safari in browser engine](https://github.com/V4Fire/Client/issues/552)

## v3.0.0-rc.182 (2021-04-28)

#### :rocket: New Feature

* Now a route pattern can be a function

#### :house: Internal

* Extracted `compileStaticRoutes` from `bRouter` to `core/router`

## v3.0.0-rc.181 (2021-04-20)

#### :house: Internal

* Extracted some helpers and interfaces from `bRouter` to `core/router`

## v3.0.0-rc.114 (2020-12-22)

#### :bug: Bug Fix

* Fixed clearing of the route history

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Removed `StaticRouteMeta.entryPoint` and `StaticRouteMeta.dynamicDependencies`

#### :rocket: New Feature

* Added `StaticRouteMeta.load`

## v3.0.0-rc.36 (2020-07-13)

#### :bug: Bug Fix

* Added a missing parameter `StaticRouteMeta.external`

#### :house: Internal

* Fixed ESLint warnings

## v3.0.0-rc.29 (2020-06-09)

#### :boom: Breaking Change

* Removed deprecated API

#### :bug: Bug Fix

* Fixed loading of external dependencies

## v3.0.0-rc.28 (2020-06-09)

#### :bug: Bug Fix

* Fixed loading of external dependencies

## v3.0.0-rc.27 (2020-06-08)

#### :house: Internal

* Improved doc
* Refactoring
