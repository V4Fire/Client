Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.62.0 (2023-10-12)

#### :rocket: New Feature

* Added theme modifier calculation to components

## v3.54.1 (2023-07-28)

#### :bug: Bug Fix

* Fixed an issue where the default behavior of the `convertStateToRouterReset` did not affect the router

## v3.54.0 (2023-07-28)

#### :rocket: New Feature

* Added possibility to change the method that will be used for transitions when the router
  synchronizes its state with the component's state by using `syncRouterState`

## v3.38.0 (2023-02-20)

#### :bug: Bug Fix

* Fixed use of `i18n` function in default prop values

## v3.35.0 (2023-02-14)

#### :boom: Breaking Change

* Changed `i18n` function type from prop to getter

## v3.30.0 (2022-10-19)

#### :rocket: New Feature

* Added a new module `InfoRender`
* Added a new `initInfoRender` method

## v3.17.0 (2022-02-24)

#### :boom: Breaking Change

* Now components don't force rendering on re-activation

#### :rocket: New Feature

* Added a new prop `renderOnActivation`

## v3.11.3 (2021-11-24)

#### :bug: Bug Fix

* Don't immediately destroy functional components

## v3.8.0 (2021-10-25)

#### :rocket: New Feature

* Added a new Snakeskin block `render`

## v3.1.0 (2021-08-04)

#### :rocket: New Feature

* Added a new `stage` modifier
* Added a new event `mounted`

#### :house: Internal

* Marked the `hook` setter as protected

## v3.0.0-rc.216 (2021-07-26)

#### :bug: Bug Fix

* Fixed providing `watchProp` in an object form

## v3.0.0-rc.213 (2021-07-22)

#### :bug: Bug Fix

* Fixed invalid resolving of `r`

## v3.0.0-rc.212 (2021-07-22)

#### :bug: Bug Fix

* Fixed an issue with dynamically created components and the `r` getter

## v3.0.0-rc.211 (2021-07-21)

#### :rocket: New Feature

* Added new props `rootTag` and `rootAttrs`

#### :bug: Bug Fix

* Fixed a case when the resolved value of `waitRef` is an empty array

## v3.0.0-rc.209 (2021-07-06)

#### :bug: Bug Fix

* Fixed updating of a component' template after changing a modifier that was registered as watchable

## v3.0.0-rc.206 (2021-06-28)

#### :bug: Bug Fix

* Fixed a bug when `isActivated` returns `undefined`

## v3.0.0-rc.203 (2021-06-21)

#### :boom: Breaking Change

* Removed `lazy`

## v3.0.0-rc.198 (2021-06-08)

#### :rocket: New Feature

* Now all watchers support suspending

## v3.0.0-rc.191 (2021-05-24)

#### :bug: Bug Fix

* Fixed a bug when using `self.load modules` with the same options within different components

## v3.0.0-rc.180 (2021-04-16)

#### :rocket: New Feature

* Added a new getter `isSSR`

## v3.0.0-rc.178 (2021-04-15)

#### :bug: Bug Fix

* Fixed a bug when dynamically created templates emit lifecycle events

## v3.0.0-rc.177 (2021-04-14)

#### :bug: Bug Fix

* Fixed a bug when using `self.loadModules` with the `wait` option

## v3.0.0-rc.175 (2021-04-12)

#### :bug: Bug Fix

* Fixed an issue when trying to load two or more modules with the same id but different parameters via `loadModules`

## v3.0.0-rc.156 (2021-03-06)

#### :bug: Bug Fix

* Updated regexp in `canSelfDispatchEvent` to match kebab-cased events but not camelCased

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
