Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.136-ssr5 (2024-12-24)

#### :bug: Bug Fix

* Fixed the bug with previous active element not loosing its focus state

## v4.0.0-beta.26 (2023-09-20)

#### :bug: Bug Fix

* Fixed providing of external classes
* Fixed initializing during SSR

## v4.0.0-beta.8 (2023-07-19)

#### :boom: Breaking Change

* Removed deprecated code
* Removed `immediateChange` event
* Renamed `listElTag` to `listElementTag`

#### :rocket: New Feature

* Added new method `getHref`

## v3.43.0 (2023-03-23)

#### :bug: Bug Fix

* Added automatic `item.value` generation

## v3.42.1 (2023-03-14)

#### :nail_care: Polish

* Changed `activeElement` getter return type

## v3.41.0 (2023-03-14)

#### :nail_care: Polish

* Added `iActiveItems` implementation

## v3.0.0-rc.211 (2021-07-21)

#### :boom: Breaking Change

* Now the component uses `<button>` is not specified `href`

#### :rocket: New Feature

* Added a new prop `attrsProp`
* Added new props `listTag` and `listElTag`
* Now the component uses `aria` attributes

## v3.0.0-rc.203 (2021-06-21)

#### :rocket: New Feature

* Added a new associated type `Active`

#### :bug: Bug Fix

* Fixed importing of `ModsTable`

## v3.0.0-rc.199 (2021-06-16)

#### :boom: Breaking Change

* `Items.classes` was replaced with `Items.mods`
* Now `toggleActive` returns a new active item
* New public API for `isActive`
* Removed deprecated API

#### :rocket: New Feature

* Now `Items.classes` uses to provide extra non-modifier classes to an element
* Now `setActive/unsetActive/toggleActive` can take multiple values

#### :bug: Bug Fix

* Now `normalizeItems` does not modify the original object

## v3.0.0-rc.140 (2021-02-05)

#### :bug: Bug Fix

* Fixed the condition to provide slots

## v3.0.0-rc.123 (2021-01-15)

#### :rocket: New Feature

* Now the component implements the `iItems` trait

#### :memo: Documentation

* Improved documentation

## v3.0.0-rc.90 (2020-10-22)

#### :boom: Breaking Change

* Renamed:
  * `interface/Option` -> `interface/Item`
  * `valueProp` -> `itemsProp`
  * `removeActive` -> `unsetActive`
  * `normalizeOptions` -> `normalizeItems`
  * `block text` -> `block value`
  * `&__link-text` -> `&__link-value`

* Changed a type of `hideLabels` from a prop to modifier
* Now the `active` getter returns a Set with `multiple = true`
* Removed `block info` from the template
* Deprecated `&__el`

#### :rocket: Breaking Change

* Added support of the default slot

#### :bug: Bug Fix

* Fixed a bug with `activeElement` and `multiple`

#### :house: Internal

* Fixed ESLint warnings
* Removed dead options from `Item`: `preIconHint`, `preIconHintPos`, `iconHint`, `iconHintPos`, `info`
* Now `Item` extends from `Dictionary`
* Refactoring

#### :nail_care: Polish

* Added documentation
