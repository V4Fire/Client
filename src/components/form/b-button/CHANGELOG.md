Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.76 (2023-03-25)

#### :boom: Breaking Change

* The `stopPropagation` for the native click event has been removed.
  Now, native click events bubble up the DOM tree.

## v3.0.0-rc.211 (2021-07-21)

#### :rocket: New Feature

* Added a new prop `attrsProp`
* Added a new getter `hasDropdown`
* Now the component uses `aria` attributes

#### :bug: Bug Fix

* Fixed a bug when providing `href` to `dataProvider`

## v3.0.0-rc.201 (2021-06-17)

#### :rocket: New Feature

* Added a new `file` type

## v3.0.0-rc.197 (2021-06-07)

#### :house: Internal

* Added initialization of `iProgress` modifier event listeners

## v3.0.0-rc.140 (2021-02-05)

#### :bug: Bug Fix

* Fixed the condition to provide slots

## v3.0.0-rc.123 (2021-01-15)

#### :rocket: New Feature

* Implemented new API from `iAccess`

## v3.0.0-rc.88 (2020-10-13)

#### :bug: Bug Fix

* [Added a boolean type for `progressIcon`](https://github.com/V4Fire/Client/pull/409/files)

## v3.0.0-rc.72 (2020-10-01)

#### :house: Internal

* Moved to `defaultRequestFilter`

## v3.0.0-rc.49 (2020-08-03)

#### :house: Internal

* Fixed ESLint warnings

#### :memo: Documentation

* Added documentation
