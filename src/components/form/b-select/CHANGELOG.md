Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.26 (2023-09-??)

#### :bug: Bug Fix

* Fixed providing of external classes
* Fixed initializing during SSR

## v4.0.0-beta.8 (2023-07-07)

#### :bug: Bug Fix

* Fixed incorrect update of the `selected` parameter in the native mode

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* `toggleValue` with `unsetPrevious = true` will unset previous value and set given value as new, previously,
  it would just unset the value.

#### :rocket: New Feature

* `b-select` now implements `iActiveItems` trait

#### :nail_care: Polish

* Decomposed and refactored the `b-select` component
* Added more unit tests and improved their descriptions

## v3.5.3 (2021-10-06)

#### :bug: Bug Fix

* Fixed synchronization of values during input events

## v3.0.0-rc.211 (2021-07-21)

#### :rocket: New Feature

* Now the component uses `aria` attributes

## v3.0.0-rc.203 (2021-06-21)

#### :boom: Breaking Change

* Now `formValue` returns an array if the component is switched to the `multiple` mode

## v3.0.0-rc.202 (2021-06-18)

#### :bug: Bug Fix

* Empty value should be equal to `undefined`
* Resetting of the component should also reset `text`

#### :house: Internal

* Added tests `bSelect`

## v3.0.0-rc.200 (2021-06-17)

#### :bug: Bug Fix

* Fixed a bug when changing of `value` does not emit selection of items
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
