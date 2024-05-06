Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-05-??)

#### :house: Internal

* Listen for i18n `setRegion` event

## 4.0.0-beta.81 (2024-04-01)

#### :bug: Bug Fix

* Fixed an error with canceling handlers added with `prepend`

## v4.0.0-beta.78 (2024-03-29)

#### :bug: Bug Fix

* Fixed an issue with the event emitter being wrapped unnecessarily into async wrapper,
  which was causing the :suspend flag and mute/unmute functions not to work correctly
  during deactivation/activation of components. [see https://github.com/V4Fire/Client/pull/1199](https://github.com/V4Fire/Client/pull/1199)

## 4.0.0-beta.75 (2024-03-22)

#### :rocket: New Feature

* Added the ability to add event handlers before the others

## v4.0.0-alpha.1 (2022-12-14)a

#### :memo: Documentation

* Added complete documentation for the module

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
