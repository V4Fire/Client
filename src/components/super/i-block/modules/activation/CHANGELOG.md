Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.??? (2024-11-??)

#### :house: Internal

* Reloading now occurs for unloaded components or when explicitly specified with `reloadOnActivation: true`

## v4.0.0-alpha.1 (2022-12-14)

#### :memo: Documentation

* Added complete documentation for the module

## v3.1.0 (2021-08-04)

#### :bug: Bug Fix

* Fixed a route comparison in the transition handler

## v3.0.0-rc.199 (2021-06-16)

#### :bug: Bug Fix

* Fixed a deadlock during component activation

## v3.0.0-rc.196 (2021-05-28)

#### :boom: Breaking Change

* Now `isReady` returns `true` if a component in `inactive`

## v3.0.0-rc.192 (2021-05-27)

#### :bug: Bug Fix

* Fixed an issue when activation events won't propagate to child components

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
