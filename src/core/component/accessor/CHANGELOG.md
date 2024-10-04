Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.138.dsl-speedup (2024-10-01)

#### :rocket: New Feature

* Introduced a new type of caching: `'forever'`

## v4.0.0-beta.106 (2024-06-25)

#### :bug: Bug Fix

* Do not store computed values in the cache before the functional component is fully created.
  This fixes hard-to-detect bugs that can occur due to context inheritance.
  See: https://github.com/V4Fire/Client/issues/1292

## v4.0.0-beta.51 (2024-01-19)

#### :bug: Bug Fix

* Fixed an error when deleting the getters cache

## v4.0.0-alpha.1 (2022-12-14)

#### :rocket: New Feature

* Added a new cache type `auto` for accessors

#### :memo: Documentation

* Added complete documentation for the module

#### :house: Internal

* Refactoring

## v3.11.4 (2021-11-24)

#### :bug: Bug Fix

* Don't cache computed properties within flyweight components

## v3.0.0-rc.78 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug with caching of computed fields

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
