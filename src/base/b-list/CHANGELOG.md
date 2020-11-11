Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.97 ()

#### :boom: Breaking Change

* Changed the model prop from `valueProp` to `activeProp`

#### :rocket: New Feature

* Added support of interpolation of a data provider response
* Added a new associated type: `Items`

#### :nail_care: Polish

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
