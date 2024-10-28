Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## 4.0.0-beta.108.a-new-hope (2024-07-15)

#### :rocket: New Feature

* Added style registration in the `getRenderFactory` method for templates in SSR

## 4.0.0-beta.87 (2024-04-12)

#### :bug: Bug Fix

* Fixed an error with recursive rendering through `getRenderFn` and the slot

## v4.0.0-beta.49 (2024-01-17)

#### :rocket: New Feature

* Now the `render` method can accept the name of an asynchronous group to control the invocation of destructors

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The module has been moved to`components/friends/vdom`
* The module has been rewritten to a new tree-shake friendly API
* Renamed `findElFromVNode` to `findElement`

#### :memo: Documentation

* Added complete documentation for the module

## v3.0.0 (2021-07-27)

#### :house: Internal

* Added tests

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
