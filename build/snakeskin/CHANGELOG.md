Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.154 (2024-??-??)

#### :bug: Bug Fix

* Fixed an issue with web component props being dasherized `build/snakeskin`

## v4.0.0-beta.153 (2024-11-15)

#### :bug: Bug Fix

* Re-fixed loss of refs in slots inside async render (see v4.0.0-beta.52)
  by converting `v-ref` to a prop for regular components `build/snakeskin/filters`

## v4.0.0-beta.145 (2024-10-14)

#### :bug: Bug Fix

* Fixed the issue with incorrectly detecting the functional smart component

## v4.0.0-beta.91 (2024-04-19)

#### :house: Internal

* Replaced anonymous functions for `getRoot` and `getParent` props
  with calls to the `$getRoot` and `$getParent` methods of the component

## v4.0.0-beta.52 (2023-01-31)

#### :bug: Bug Fix

* Fixed the memoization of `getParent`: it was saved in the context of the main component, as a
  result of which the components in the slots had an incorrect `$parent`

## v4.0.0-beta.49 (2024-01-17)

#### :bug: Bug Fix

* Added memoization for the `getParent` and `getRoot` props to prevent unnecessary re-renders

## v4.0.0-beta.38 (2023-11-15)

#### :bug: Bug Fix

* The function `getParent` now checks if the component is inside a slot

## v4.0.0-beta.28 (2023-09-26)

#### :rocket: New Feature

* Added the `n` filter for correctly overriding templates within the same namespace
* Added the ability to create hard links in the `b` filter for correctly overriding templates

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Removed the `getFirstTagElementName` filter

#### :memo: Documentation

* Added complete documentation for the module

## v3.46.3 (2023-04-28)

#### :bug: Bug Fix

* Fixed a bug with the snakeskin filter that didn't work due to the wrong locale path.

## v3.43.1 (2023-03-27)

#### :bug: Bug Fix

* Fixed a bug when typograf does not support the given locale

## v3.15.0 (2021-12-16)

#### :bug: Bug Fix

* Fixed issues with symlinks

## v3.10.0 (2021-11-16)

#### :boom: Breaking Change

* Removed legacy filters for `:key` attributes

## v3.4.0 (2021-09-09)

#### :house: Internal

* Review modules
