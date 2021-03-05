Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.155 (2021-03-05)

#### :rocket: New Feature

* Added a new method `canSelfDispatchEvent` to prevent self dispatching of some events

#### :bug: Bug Fix

* Now `componentStatus` and `componentHook` events can't be self dispatched

## v3.0.0-rc.152 (2021-03-04)

#### :house: Internal

* Added a `try-catch` block to suppress async errors on component rerender in `onUpdateHook`

## v3.0.0-rc.142 (2021-02-11)

#### :bug: Bug Fix

* Fixed an issue when refs are not resolved after the `update` hook

## v3.0.0-rc.132 (2021-01-29)

#### :rocket: New Feature

* Now function and flyweight components support `asyncRender`

## v3.0.0-rc.131 (2021-01-29)

#### :boom: Breaking Change

* Removed the `componentStatus` modifier

#### :rocket: New Feature

* Added a new prop `verbose`
* Added a new getter `isNotRegular`

## v3.0.0-rc.127 (2021-01-26)

#### :bug: Bug Fix

* Fixed `componentStatus` with flyweight components

## v3.0.0-rc.126 (2021-01-26)

#### :boom: Breaking Change

* Renamed the `status` modifier to `component-status`

#### :rocket: New Feature

* Now switching a value of the component hook emits events

#### :house: Internal

* Added API based on the `v-hook` directive to attach hook listeners with functional and flyweight components

## v3.0.0-rc.121 (2021-01-12)

#### :memo: Documentation

* Improved jsDoc

## v3.0.0-rc.112 (2020-12-18)

#### :rocket: New Feature

* Added support of `wait` and `renderKey` `loadModules`

## v3.0.0-rc.110 (2020-12-16)

#### :rocket: New Feature

* Added API to load the dynamic dependencies

## v3.0.0-rc.92 (2020-11-03)

#### :nail_care: Polish

* Added tests

## v3.0.0-rc.90 (2020-10-22)

#### :boom: Breaking Change

* Now all extra classes that were added by using `appendToRootClasses` added to the start of the declaration

## v3.0.0-rc.88 (2020-10-13)

#### :bug: Bug Fix

* Fixed initializing of `stageStore`

## v3.0.0-rc.85 (2020-10-09)

#### :boom: Breaking Change

* Now `dontWaitRemoteProviders` is calculated automatically
* Marked as non-functional:
  * `stageStore`
  * `componentStatusStore`
  * `watchModsStore`

## v3.0.0-rc.65 (2020-09-21)

#### :nail_care: Polish

* Fixed JSDoc `Statuses` -> `ComponentStatus`

## v3.0.0-rc.62 (2020-09-04)

#### :rocket: New Feature

* Added `dontWaitRemoteProviders`

## v3.0.0-rc.56 (2020-08-06)

#### :bug: Bug Fix

* Fixed `initLoad` error handling

## v3.0.0-rc.54 (2020-08-04)

#### :house: Internal

* Marked as public `isComponent`

## v3.0.0-rc.48 (2020-08-02)

#### :rocket: New Feature

* Added `initLoadStart` event

## v3.0.0-rc.39 (2020-07-23)

#### :house: Internal

* Added `waitRef` to `UnsafeIBlock`

## v3.0.0-rc.37 (2020-07-20)

#### :boom: Breaking Change

* Marked `router` as optional
* Marked `block` as optional

#### :rocket: New Feature

* Added support of mounted watchers

```js
this.watch(anotherWatcher, () => {
  console.log('...');
});

this.watch({ctx: anotherWatcher, path: foo}, () => {
  console.log('...');
});
```

#### :house: Internal

* Fixed ESLint warnings

## v3.0.0-rc.18 (2020-05-24)

#### :boom: Breaking Change

* Renamed `interface/Unsafe` to `interface/UnsafeIBlock`
