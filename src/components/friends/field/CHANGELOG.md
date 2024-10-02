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

* Added a new method for efficient access to the field store `getFieldsStore`

#### :house: Internal

* Performance improvements

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The module has been moved to`components/friends/field`
* The module has been rewritten to a new tree-shake friendly API

## v3.10.0 (2021-11-16)

#### :rocket: New Feature

* Now `get` can access properties through promises

## v3.0.0-rc.203 (2021-06-21)

#### :bug: Bug Fix

* Fixed a bug after setting a non-exist property that has bound watchers

#### :memo: Documentation

* Improved documentation

#### :house: Internal

* Added tests

## v3.0.0-rc.91 (2020-10-29)

#### :bug: Bug Fix

* Fixed working with watchers based on accessors
* Fixed resolving of accessors

## v3.0.0-rc.86 (2020-10-11)

#### :bug: Bug Fix

* Fixed an optimization of lazy watchers

## v3.0.0-rc.77 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug when trying to access a prop value before a component create

## v3.0.0-rc.69 (2020-09-28)

#### :boom: Breaking Change

* Renamed `FieldGetter` -> `ValueGetter`

#### :rocket: New Feature

* Added `getter` for `set` and `delete` methods

#### :bug: Bug Fix

* Fixed a bug when a system field can't be watched after removal of a property

#### :nail_care: Polish

* Added more examples

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
