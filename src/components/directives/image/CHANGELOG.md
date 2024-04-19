Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## 4.0.0-beta.?? (2024-04-??)

#### :bug: Bug Fix

* Fixed an incorrect size of the background image

## 4.0.0-beta.86 (2024-04-11)

#### :boom: Breaking Change

* The directive cannot be applied to img, picture, or object elements

#### :rocket: New Feature

* Added support for standard img tag attributes

## 4.0.0-beta.84 (2024-04-11)

#### :bug: Bug Fix

* Fixed an error with incorrect handling of the empty required `src` attribute

## 4.0.0-beta.81 (2024-04-01)

#### :bug: Bug Fix

* Fixed an error with incorrect handling of errors caused by the Async wrapper

## v4.0.0-beta.47 (2024-01-16)

#### :bug: Bug Fix

* Fixed incorrect image state during hydration

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Removed the ability to render an image as a background
* Removed all properties that can be configured via CSS
* The directive now adds nodes to its container

#### :rocket: New Feature

* Added support for lazy loading

#### :house: Internal

* Migration to Vue3

## v3.0.0-rc.63 (2020-09-10)

#### :house: Internal

* [Split the `directives/image` module into two: API was moved to `core/dom/image`](https://github.com/V4Fire/Client/issues/168)

## v3.0.0-beta.237 (2019-12-19)

#### :rocket: New Feature

* Initial release
