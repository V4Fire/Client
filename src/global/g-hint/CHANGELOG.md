Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.61 ()

#### :boom: Breaking Change

* Renamed:
  * `target` -> `location`
  * `showSelector` -> `showOn`
  * `hintData` -> `dataAttr`

* Replaced:
  * `horArrowSize`, `vertArrowSize` -> `arrowSize`
  * `color`, `bgColor`, `rounding`, `shadow` -> `contentStyles`

* Removed:
  * Auto-hide logic: now you need to specify the `hidden` option

* Changed the way how to use the mixin

#### :rocket: New Feature

* Added `arrowStyles`, `hideStyles`, `showStyles`
* Added `interface.ts`

#### :nail_care: Polish

* Added documentation
