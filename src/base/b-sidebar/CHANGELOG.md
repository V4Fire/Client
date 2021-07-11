Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.??? (2021-??-??)

#### :boom: Breaking Change

* Now the component uses `<aside>` within

## v3.0.0-rc.112 (2020-12-18)

#### :boom: Breaking Change

* Now `forceInnerRender` is toggled to `true` by default

## v3.0.0-rc.111 (2020-12-16)

#### :bug: Bug Fix

* Fixed render logic

## v3.0.0-rc.110 (2020-12-16)

#### :rocket: New Feature

* Added `forceInnerRender`

## v3.0.0-rc.100 (2020-11-17)

#### :house: Internal

* Rendering optimization

## v3.0.0-rc.98 (2020-11-13)

#### :boom: Breaking Change

* Removed style properties (`p.overlayBg`, `p.overlayTansition`), prefer to use `provide.classes` or style overriding
* Renamed a style property: `sideBarTransition` -> `sidebarTransition`

#### :bug: Bug Fix

* Added the missing `over-wrapper` element

#### :house: Internal

* Fixed ESLint errors
* Fixed TS errors
* Added tests
