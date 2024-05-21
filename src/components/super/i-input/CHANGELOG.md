Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.88 (2024-04-12)

#### :bug: Bug Fix

* Fixed the issue of the on-screen keyboard disappearing when validators are specified on the input field

## v4.0.0-beta.40 (2023-11-17)

#### :boom: Breaking Change

* Moved `message` block from `helpers` to `bodyFooter` block

## v4.0.0-beta.12 (2023-08-21)

#### :bug: Bug Fix

* If the element was in focus, it needs to be restored after validating

## v3.49.0 (2023-05-31)

#### :rocket: New Feature

* Added ability to specify a custom validator function

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Renamed `getValidationMsg` to `getValidationMessage`
* Renamed `setValidationMsg` to `setValidationMessage`

## v3.0.0-rc.199 (2021-06-16)

#### :boom: Breaking Change

* Removed `valueKey`
* Now `groupFormValue` always returns an array
* Renamed `dataType` to `formValueConverter`
* Renamed `hiddenInputTag` to `nativeInputTag`
* Renamed `hiddenInputType` to `nativeInputType`
* Renamed `hiddenInputModel` to `nativeInputModel`

#### :rocket: New Feature

* Added support of interpolation of a data provider response
* Implemented new API from `iAccess`
* Now `formValueConverter` can be provided as an array
* Added support for the `Maybe` structure
* Added `attrsProp/attrs` properties
* Added the `normalizeAttrs` method
* Added the `nativeInput` block

#### :house: Internal

* Improved error handling
* Added `UnsafeIInput`

#### :nail_care: Polish

* Improved documentation

## v3.0.0-rc.49 (2020-08-03)

#### :house: Internal

* Fixed ESLint warnings
