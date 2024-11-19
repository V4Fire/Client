Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.154.dsl-speedup-3 (2024-11-19)

#### :house: Internal

* When inheriting metaobjects, prototype chains are now used instead of full copying.
  This optimizes the process of creating metaobjects.
* Methods and accessors are now added to the metaobject via the `method` decorator instead of runtime reflection.
  This decorator is automatically added during the build process.
* Optimized creation of metaobjects.

## v4.0.0-beta.138.dsl-speedup (2024-10-01)

#### :rocket: New Feature

* Added the `partial` parameter for the declaration of components consisting of multiple classes

## v4.0.0-beta.137 (2024-09-24)

#### :house: Internal

* Added a [[RENDER]] event before calling the component's render function

## v4.0.0-beta.71 (2024-03-12)

#### :rocket: New Feature

* Added a new field `layer`, which allows you to obtain information about the package in which the component was declared

## v4.0.0-beta.21 (2023-09-14)

#### :rocket: New Feature

* Added a new hook `after:beforeDataCreate`

## v4.0.0-alpha.1 (2022-12-14)

#### :rocket: New Feature

* Added support for cache delegation of computed fields

#### :memo: Documentation

* Added complete documentation for the module

#### :house: Internal

* Refactoring

## v3.0.0-rc.177 (2021-04-14)

#### :house: Internal

* Added `attachTemplatesToMeta`
* Renamed `inherit` to `inheritMeta`

## v3.0.0-rc.88 (2020-10-13)

#### :house: Internal

* Added `functionalWatching` `interface/types/ComponentSystemField`

## v3.0.0-rc.84 (2020-10-09)

#### :rocket: New Feature

* Added `ComponentMeta.tiedFields`

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
