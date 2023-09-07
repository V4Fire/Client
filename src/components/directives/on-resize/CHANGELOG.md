Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The directive has been renamed to `v-on-resize` and now uses the new `core/dom/resize-watcher` module API

#### :house: Internal

* Migration to Vue3

## v3.0.0-rc.82 (2020-10-08)

#### :bug: Bug Fix

* Fixed a typo after refactoring

## v3.0.0-rc.79 (2020-10-08)

#### :boom: Breaking Change

* Directive mods are no longer supported
* Renamed to `v-resize-observer`

#### :house: Internal

* [Split the module into two: API was moved to `core/dom/resize-observer`](https://github.com/V4Fire/Client/issues/311)
