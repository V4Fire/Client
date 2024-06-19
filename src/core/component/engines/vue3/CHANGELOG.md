Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.104 (2024-06-19)

#### :house: Internal

* Use `r` instead of `$root` as the prototype of the root with the `$remoteParent`

## v4.0.0-beta.83 (2024-04-08)

#### :house: Internal

* Re-export `withMemo`

## v4.0.0-beta.54 (2024-02-06)

#### :bug: Bug Fix

* Fixed an issue with memory leaks in `vdom.render`

## v4.0.0-beta.50 (2024-01-19)

#### :bug: Bug Fix

* Fixes an error that caused the application to go into an infinite loop when deleting nodes

## v4.0.0-beta.49 (2024-01-17)

#### :bug: Bug Fix

* Fixed a memory leak when creating dynamic components via the VDOM API

## v4.0.0-beta.23 (2023-09-18)

#### :bug: Bug Fix

* Fixed components' props normalization during SSR

## v4.0.0-beta.15 (2023-09-05)

#### :bug: Bug Fix

* Added filtering of empty leading and trailing text nodes during rendering of a VNode array

## v4.0.0-alpha.1 (2022-12-14)

#### :rocket: New Feature

* Initial release
