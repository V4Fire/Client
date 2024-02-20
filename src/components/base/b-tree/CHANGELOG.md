Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.55 (2024-02-08)

#### :boom: Breaking Change

* Now all nested trees are rendered as functional
* Now, by default, folded items are not rendered

#### :rocket: New Feature

* Added new values for the `lazyRender` prop

#### :bug: Bug Fix

* Fixed errors when using the tree as a functional component

## v4.0.0-beta.37 (2023-10-27)

#### :bug: Bug Fix

* Fixed an issue with folding tree items

## v4.0.0-beta.26 (2023-09-20)

#### :bug: Bug Fix

* Fixed initializing during SSR

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* By default, the component is rendered synchronously

#### :rocket: New Feature

* Added a new prop `lazyRender`

## v3.43.0 (2023-03-23)

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

#### :bug: Bug Fix

* Fixed passing props to nested trees
* Fixed an issue with the prop `itemProps` not being added to items' attributes
* Fixed adding the `folded_false` class to items without children

## v3.0.0-rc.164 (2021-03-22)

#### :house: Internal

* Fixed a race condition with the test case that waits for timeouts

## v3.0.0-rc.122 (2021-01-13)

#### :rocket: New Feature

* First release
