Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.170 (2024-12-19)

#### :house: Internal

* [The `performance` option in the Vue engine config is set to true by default for the dev build](https://github.com/V4Fire/Client/issues/1389)

## v4.0.0-beta.150 (2024-11-05)

#### :bug: Bug Fix

* Omit detailed component information to prevent event loop freezing associated
with certain warnings. Vue uses a `get` trap within the proxy to verify the presence
of a property in the instance. Accessing undefined properties via the `getComponentInfo` method
during a warn or error handler will trigger infinite recursion.

## v4.0.0-beta.141 (2024-10-03)

#### :bug: Bug Fix

* Do not call destructor recursively on before unmount

## v4.0.0-beta.139.dsl-speedup-2 (2024-10-03)

#### :house: Internal

* Migration to the Composition API
* Added support for the `renderTracked` hook

## v4.0.0-beta.112 (2024-07-22)

#### :bug: Bug Fix

* Fixed a bug where passing a `nullable` value to a directive would result in it not being bound to the vNode

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
