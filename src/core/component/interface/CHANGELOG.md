Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-06-??)

#### :bug: Bug Fix

* Fixed unwanted execution of unmount handlers in the directives used
  within the functional component during its re-creation.
  The `$destroy` method now accepts an object with options, which enables control over
  both the recursion of the destructor and the execution of unmount handlers in the
  directives used within the component `core/component/interface`

## v4.0.0-beta.104 (2024-06-19)

#### :rocket: New Feature

* The `$destroy` method now accepts a recursive parameter for targeted removal
  of the component without deleting its children and vice versa

#### :house: Internal

* The getter `r` has been moved from `iBlock` to `ComponentInterface`

## v4.0.0-beta.91 (2024-04-19)

#### :rocket: New Feature

* Added `$getRoot` and `$getParent` methods to the `ComponentInterface`

## v4.0.0-beta.62 (2024-02-19)

#### :rocket: New Feature

* Added an app property to get a reference to the application object

## v4.0.0-beta.32 (2023-10-17)

#### :rocket: New Feature

* Added support for setting a global application ID

## v4.0.0-beta.22 (2023-09-15)

#### :rocket: New Feature

* Added a new property `ssrState`

## v4.0.0-beta.21 (2023-09-14)

#### :rocket: New Feature

* Added a new hook `after:beforeDataCreate`

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Migration to Vue3

#### :house: Internal

* Added `App` interface

## v3.0.0-rc.206 (2021-06-28)

#### :rocket: New Feature

* Added `activate` and `deactivate` to `ComponentInterface`

## v3.0.0-rc.180 (2021-04-16)

#### :rocket: New Feature

* Added a new property `$initializer`
* Added a new property `$renderEngine`

## v3.0.0-rc.126 (2021-01-26)

#### :boom: Breaking Change

* Removed the `beforeMounted` hook

## v3.0.0-rc.48 (2020-08-02)

#### :rocket: New Feature

* Added `$componentId`

## v3.0.0-rc.37 (2020-07-20)

#### :boom: Breaking Change

* Marked `$el` as optional
* Changed the `SyncLinkCache` type from Dictionary to Map

#### :house: Internal

* Fixed ESLint warnings
