Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.77 ()

#### :boom: Breaking Change

* Renamed `interface/Option` -> `interface/Item`
* Renamed `valueProp` -> `itemsProp`
* Changed a type of `hideLabels` from a prop to modifier
* Renamed `removeActive` -> `unsetActive`
* Renamed `normalizeOptions` -> `normalizeItems`
* Now the `active` getter returns a Set with `multiple = true`
* Removed `block info` from the template
* Renamed `block text` to `block value`
* Renamed `&__link-text` to `&__link-value`
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
