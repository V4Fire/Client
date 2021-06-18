Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.202 (2021-06-18)

#### :bug: Bug Fix

* Empty value should be equal to `undefined`
* Resetting of the component should also reset `text`

#### :house: Internal

* Added tests `bSelect`

## v3.0.0-rc.200 (2021-06-17)

#### :bug: Bug Fix

* Fixed a bug when changing of `value` doesn't emit selection of items
* Fixed built-in `required` validator

#### :memo: Documentation

* Added documentation

## v3.0.0-rc.199 (2021-06-16)

#### :boom: Breaking Change

* Now the component inherits `iInputText`
* Now the component implements `iItems`

#### :rocket: New Feature

* Added a feature of multiple selection
* Added `isSelected/selectValue/unselectValue/toggleValue`

#### :house: Internal

* Fixed ESLint warnings
