Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.??.?? (2023-??-??)

#### :boom: Breaking Change

* The module has been moved to`components/friends/state`
* The module has been rewritten to a new tree-shake friendly API

#### :rocket: New Feature

* Added possibility to change the method that will be used for transitions when the router
  synchronizes its state with the component's state by using `syncRouterState`

#### :bug: Bug Fix

* Fixed resetting router state

#### :memo: Documentation

* Added complete documentation for the module

## v3.0.0 (2021-07-27)

#### :bug: Bug Fix

* Fixed removing of modifiers

#### :house: Internal

* Added tests

## v3.0.0-rc.123 (2021-01-15)

#### :boom: Breaking Change

* Changed an interface of `set`

#### :rocket: New Feature

* Added support of method invoking `set`

#### :memo: Documentation

* Improved documentation

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Now `initFromStorage` returns `CanPromise`

## v3.0.0-rc.45 (2020-07-30)

#### :bug: Bug Fix

* Fixed deadlock on initializing

## v3.0.0-rc.44 (2020-07-30)

#### :bug: Bug Fix

* Fixed initializing of the router

## v3.0.0-rc.42 (2020-07-30)

#### :bug: Bug Fix

* Fixed `resetRouter` without providing of `convertRouterState`

#### :house: Internal

* Fixed ESLint warnings
