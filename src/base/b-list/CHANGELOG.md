Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.60 ()

#### :boom: Breaking Change

* Renamed `interface/Option` -> `interface/Item`
* Renamed `valueProp` -> `itemsProp`
* Changed a type of `hideLabels` from a prop to modifier

#### :house: Internal

* Fixed ESLint warnings
* Removed dead options from `Item`: `preIconHint`, `preIconHintPos`, `iconHint`, `iconHintPos`, `info`
* Now `Item` extends from `Dictionary`

#### :nail_care: Polish

* Added documentation
