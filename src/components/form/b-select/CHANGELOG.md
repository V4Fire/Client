Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## 4.0.0-beta.72 (2024-03-13)

#### :bug: Bug Fix

* Fixed the loss of the keydown event handler when recreating a functional component
* Fixed the issue of the dropdown not closing when clicking on an element with stop propagation

## v4.0.0-beta.70 (2024-03-05)

#### :bug: Bug Fix

* Fixed an issue with missing methods `element` and `elements` in the Block prototype

## 4.0.0-beta.71 (2024-03-12)

#### :bug: Bug Fix

* Fixed an error that the text in native mode was not synchronized with the value
* Implemented correct switching between elements when pressing the `Tab` key

## v4.0.0-beta.40 (2023-11-17)

#### :boom: Breaking Change

* Moved `dropdown` block from `helpers` to `bodyFooter` block

## v4.0.0-beta.26 (2023-09-20)

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
