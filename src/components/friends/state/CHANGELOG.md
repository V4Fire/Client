Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## 4.0.0-beta.?? (2024-??-??)

#### :bug: Bug Fix

* Set the component's hydration store if only the component is in the context of SSR
  and should render it's content during the server-side rendering

## v4.0.0-beta.43 (2023-11-26)

#### :bug: Bug Fix

* There is no need to synchronize router data during SSR

## v4.0.0-beta.29 (2023-10-02)

#### :bug: Bug Fix

* Save state to hydration store during SSR

## v4.0.0-alpha.1 (2022-12-14)

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
