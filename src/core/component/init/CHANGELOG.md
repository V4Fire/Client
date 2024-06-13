Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.91 (2024-04-19)

#### :rocket: New Feature

* Implemented the `$getRoot` and `$getParent` methods on the component's instance

## v4.0.0-beta.68 (2024-02-29)

#### :bug: Bug Fix

* Fix the disappearance of functional components in cached pages:
do not call the destroy method on the rendering engine if `$el` has the `component` property

## v4.0.0-beta.50 (2024-01-19)

#### :bug: Bug Fix

* When calling the destructor, it is necessary to clean up nodes of any components

## v4.0.0-beta.49 (2024-01-17)

#### :bug: Bug Fix

* Fixed memory leaks when removing components

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Renamed the module to `init`

#### :rocket: New Feature

* Added new state initializers `render-tracked` and `render-trigered`

#### :memo: Documentation

* Added complete documentation for the module

## v3.0.0-rc.147 (2021-02-18)

#### :bug: Bug Fix

* Fixed providing of destroying events to external components

## v3.0.0-rc.146 (2021-02-15)

#### :bug: Bug Fix

* Fixed providing of activation events to external components

## v3.0.0-rc.145 (2021-02-12)

#### :house: Internal

* Now external activation hooks are fired with a delay

## v3.0.0-rc.130 (2021-01-28)

#### :bug: Bug Fix

* Fixed resolving of ref-s

## v3.0.0-rc.129 (2021-01-28)

#### :house: Internal

* Optimized creation of flyweight components

## v3.0.0-rc.126 (2021-01-26)

#### :boom: Breaking Change

* Removed the `beforeMounted` hook

## v3.0.0-rc.84 (2020-10-09)

#### :bug: Bug Fix

* Fixed a bug when using a complex path as a dependency

#### :house: Internal

* Optimized creation of components

## v3.0.0-rc.80 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug when using an array of dependencies to watch an accessor

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
