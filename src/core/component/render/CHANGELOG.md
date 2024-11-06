Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-11-??)

#### :bug: Bug Fix

* Fixed the `resolveAttrs` function: property getters are no longer removed from props, the `v-attrs` directive now resolves with the correct method in SSR
* Calls `resolveAttrs` to resolve directives for components rendered with `ssrRenderComponent`

## v4.0.0-beta.149 (2024-10-31)

#### :rocket: New Feature

* Added a wrapper for `withModifiers` with support for the `safe` modifier

## v4.0.0-beta.148 (2024-10-28)

#### :house: Internal

* Create a `normalizeComponentForceUpdateProps` for normalizing the props with `forceUpdate = false`

## v4.0.0-beta.140 (2024-10-03)

#### :bug: Bug Fix

* Fixed incorrect `shapeFlag` on a functional vnode

## v4.0.0-beta.139.dsl-speedup-2 (2024-10-03)

#### :rocket: New Feature

* Added a new default prop `getPassedProps`, which allows identifying which props were passed through the template

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
