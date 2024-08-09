Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.74.5 (2024-08-02)

#### :rocket: New Feature

* The `eventConverter` function can now return a tuple consisting of the page component name and page component key, instead of just a string representing the page component name

#### :bug: Bug Fix

* Fixed an issue where a new page component instance was not created when switching between routes that use the same page component

## v3.71.0 (2024-04-19)

#### :rocket: New Feature

* Introduced a `beforeSwitchPage` event that is emitted prior to the removal of the current page element
* Implemented an API for saving the horizontal scroll of nested DOM nodes on the page.
  [Learn more](./README.md#api-for-saving-scroll-of-nested-dom-nodes).

## v3.13.3 (2021-12-08)

#### :bug: Bug Fix

* Removed the race condition while loading a new page

## v3.5.4 (2021-10-12)

#### :bug: Bug Fix

* Fixed an issue when `component` returns `undefined`

## v3.5.0 (2021-09-16)

#### :boom: Breaking Change

* Fixed some cases when the previous page

## v3.2.3 (2021-08-05)

#### :bug: Bug Fix

* Fixed providing of `keepAlive`

## v3.0.0-rc.215 (2021-07-25)

#### :bug: Bug Fix

* Fixed a bug when the `component` getter is `undefined`. Now the getter can return a promise in that case.

## v3.0.0-rc.204 (2021-06-23)

#### :bug: Bug Fix

* Fixed a bug when removing a valid keep-alive element from the cache

## v3.0.0-rc.193 (2021-05-28)

#### :bug: Bug Fix

* Fixed a bug when switching pages via `pageProp` and `page`

## v3.0.0-rc.192 (2021-05-27)

#### :rocket: New Feature

* Rewritten with a new keep-alive strategy

#### :memo: Documentation

* Added documentation
