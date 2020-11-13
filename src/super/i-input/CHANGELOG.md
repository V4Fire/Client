Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.?? ()

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
* Added the `attrsProp/attrs` properties
* Added the `nativeInput` block

#### :house: Internal

* Improved error handling

#### :nail_care: Polish

* Improved documentation

## v3.0.0-rc.49 (2020-08-03)

#### :house: Internal

* Fixed ESLint warnings
