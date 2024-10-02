Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-??-??)

#### :bug: Bug Fix

* Fixed a bug with the removal of modifiers from a comment node

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The module has been moved to`components/friends/block`
* The module has been rewritten to a new tree-shake friendly API
* Renamed `getElMod`, `setElMod`, `removeElMod`, `getElSelector`, `getFullElName` to
  `getElementMod`, `setElementMod`, `removeElementMod`, `getElementSelector`, `getFullElementName`

#### :memo: Documentation

* Added complete documentation for the module

## v3.8.3 (2021-10-26)

#### :bug: Bug Fix

* Fixed a bug with removing a modifier from the passed node

## v3.0.0-rc.161 (2021-03-18)

#### :bug: Bug Fix

* Fixed checks weather component is regular or not

## v3.0.0-rc.131 (2021-01-29)

#### :boom: Breaking Change

* Don't emit global component events during initializing

## v3.0.0-rc.129 (2021-01-28)

#### :house: Internal

* Optimized creation of flyweight components

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
