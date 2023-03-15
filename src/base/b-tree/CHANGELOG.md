Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.??.?? (2023-??-??)

#### :bug: Bug Fix

* Added automatic `item.value` generation
* Fixed overloads for `fold`/`unfold` methods

## v3.41.0 (2023-03-14)

#### :boom: Breaking Change

* Renamed option `Item['id']` to `Item['value']`

#### :rocket: New Feature

* Added `iActiveItems` implementation

## v3.32.0 (2022-12-21)

#### :house: Internal

* Added new methods `traverse`, `fold`, `unfold`, `toggleFold`
* Added a new modifier `clickableArea`

#### :bug: Bug Fix

* Fixed passing props to nested trees
* Fixed an issue with the prop `itemProps` not being added to items attributes
* Fixed adding the `folded_false` class to items without children

## v3.0.0-rc.164 (2021-03-22)

#### :house: Internal

* Fixed a race condition with the test case that waits for timeouts

## v3.0.0-rc.122 (2021-01-13)

#### :rocket: New Feature

* First release
