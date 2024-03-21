Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-??-??)

#### :boom: Breaking Change

* The module has been completely redesigned for the new API

## v4.0.0-beta.64 (2024-02-19)

#### :bug: Bug Fix

* Fixed a typo when extending the property for inject

## v4.0.0-beta.58 (2024-02-14)

#### :bug: Bug Fix

* Fixed a memory leak

## v4.0.0-beta.57 (2024-02-13)

#### :bug: Bug Fix

* Fixed a memory leak

## v4.0.0-beta.48 (2024-01-17)

#### :boom: Breaking Change

* Now it is necessary to pass the application initialization flags to the `ready` method from
  the initialization parameters, instead of importing it from `core/init`, due to SSR

## v4.0.0-beta.44 (2023-12-06)

#### :boom: Breaking Change

* Now, the `initApp` call returns an object in the form `{content, styles}`

## v4.0.0-beta.32 (2023-10-17)

#### :rocket: New Feature

* Added support for setting a global application ID

## v4.0.0-beta.22 (2023-09-15)

#### :rocket: New Feature

* Added support for `ssrState`

## v4.0.0-beta.18 (2023-09-08)

#### :rocket: New Feature

* Added a new parameter `setup`

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
