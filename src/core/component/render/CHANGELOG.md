Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-??-??)

#### :house: Internal

* [Now key functions such as `createBlock` and `renderList` are being measured using the Performance API and will be available on the timeline](https://github.com/V4Fire/Client/issues/1389)

## v4.0.0-beta.107 (2024-07-10)

#### :bug: Bug Fix

* Fixed incorrect `patchFlag` when creating vnode with event handler

## v4.0.0-beta.82 (2024-04-02)

#### :bug: Bug Fix

* Fixed crash on undefined value in renderList source

## v4.0.0-beta.57 (2024-02-13)

#### :bug: Bug Fix

* Fixed the loss of event handlers in functional components

## v4.0.0-beta.52 (2023-01-31)

#### :bug: Bug Fix

* Fixed loss of refs in slots inside async render

## v4.0.0-beta.38 (2023-11-15)

#### :bug: Bug Fix

* The function `getParent` now checks if the component is inside a slot

## v4.0.0-beta.25 (2023-09-19)

#### :bug: Bug Fix

* Fixed components' props normalization during SSR

## v4.0.0-beta.23 (2023-09-18)

#### :bug: Bug Fix

* Fixed components' props normalization during SSR

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The `data-cached-dynamic-class` attribute format is changed to the `core/json#evalWith` reviver format

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
