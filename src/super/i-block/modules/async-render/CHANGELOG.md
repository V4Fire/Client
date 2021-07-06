Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.209 (2021-07-06)

#### :rocket: New Feature

* Added possibility to provide the element to drop via a function

## v3.0.0-rc.208 (2021-06-29)

#### :bug: Bug Fix

* Don't render empty iterables
* Fixed infinity loop with `waitForceRender`

## v3.0.0-rc.207 (2021-06-28)

#### :bug: Bug Fix

* Fixed emitting of `asyncRenderComplete`

## v3.0.0-rc.206 (2021-06-28)

#### :bug: Bug Fix

* Fixed a bug when async rendered components don't call their destructors after removing from DOM

## v3.0.0-rc.205 (2021-06-24)

#### :bug: Bug Fix

* Now all operations that are registered by asyncRender use only `async`, but not `$async`
* Fixed a bug when rendered chunk are destroyed after creation when passed a custom async group

## v3.0.0-rc.204 (2021-06-23)

#### :boom: Breaking Change

* Now to iterate objects is used `Object.entries`
* Now `filter` with a negative value removes elements from the render queue

## v3.0.0-rc.194 (2021-05-28)

#### :bug: Bug Fix

* Fixed a bug with referencing a closure' value in the `iterate` method

## v3.0.0-rc.192 (2021-05-27)

#### :rocket: New Feature

* Added a new event `asyncRenderChunkComplete`

#### :bug: Bug Fix

* Prevented the infinity loop when passing non-iterable objects to `iterate`

## v3.0.0-rc.191 (2021-05-24)

#### :rocket: New Feature

* Added overloads for infinite iterators
* Added `waitForceRender`

## v3.0.0-rc.147 (2021-02-18)

#### :rocket: New Feature

* Emit an event when async rendering is completed

## v3.0.0-rc.138 (2021-02-04)

#### :rocket: New Feature

* Added a new parameter `TaskParams.useRAF`

## v3.0.0-rc.131 (2021-01-29)

#### :house: Internal

* Now all tasks will execute on `requestAnimationFrame`

## v3.0.0-rc.112 (2020-12-18)

#### :bug: Bug Fix

* Fixed providing of render groups

## v3.0.0-rc.105 (2020-12-09)

#### :rocket: New Feature

* Added the default value to `iterate/slice`

#### :bug: Bug Fix

* Fixed a bug with redundant `v-for` invokes
* Fixed a bug when `iterate` takes the rejected promise
* Fixed the global blocking of rendering when using a filter that returns a promise

## v3.0.0-rc.100 (2020-11-17)

#### :rocket: New Feature

* Added support of filters with promises

## v3.0.0-rc.68 (2020-09-23)

#### :boom: Breaking Change

* Renamed `TaskI.list` -> `TaskI.iterable`
* Renamed `TaskOptions` -> `TaskParams`

#### :bug: Bug Fix

* Fixed rendering of arrays

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
