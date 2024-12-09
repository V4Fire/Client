Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.165 (2024-12-09)

#### :bug: Bug Fix

* Fix binding a non-promise handler for the custom watcher.
After rewriting the loop from `.forEach` to native `for`, `return` statement was not changed to `continue`.

## v4.0.0-beta.161 (2024-12-03)

#### :bug: Bug Fix

* Fix watching for nested fields inside `$attrs`

## v4.0.0-beta.153 (2024-11-15)

#### :bug: Bug Fix

* Fix error "ctx.$vueWatch is not a function" caused by the incorrect fix in the v4.0.0-beta.146

## v4.0.0-beta.146 (2024-10-18)

#### :bug: Bug Fix

* Fixed `$attrs` not being watched

## v4.0.0-alpha.1 (2022-12-14)

#### :rocket: New Feature

* Added a new watch option `flush`

#### :house: Internal

* Refactoring

## v3.15.2 (2021-12-28)

#### :bug: Bug Fix

* Fixed watching of computed properties that tied with mounted watchers

## v3.0.0-rc.211 (2021-07-21)

#### :bug: Bug Fix

* Fixed watching with parameters `{immediate: true, collapse: true}`

## v3.0.0-rc.198 (2021-06-08)

#### :rocket: New Feature

* Now all watchers support suspending

## v3.0.0-rc.188 (2021-05-14)

#### :rocket: New Feature

* Added a feature to attach listeners on promises with emitters by using `@watch`

## v3.0.0-rc.162 (2021-03-19)

#### :bug: Bug Fix

* Fixed a bug when getter can't be watched when it depends on an external property

## v3.0.0-rc.94 (2020-11-06)

#### :bug: Bug Fix

* Fixed initializing of watchers based on accessors

## v3.0.0-rc.88 (2020-10-13)

#### :house: Internal

* Added support of `functionalWatching`

## v3.0.0-rc.88 (2020-10-13)

#### :house: Internal

* Added support of `functionalWatching`

## v3.0.0-rc.87 (2020-10-11)

#### :bug: Bug Fix

* Fixed restoring of a functional state

## v3.0.0-rc.86 (2020-10-11)

#### :bug: Bug Fix

* Fixed immediate watchers

## v3.0.0-rc.85 (2020-10-09)

#### :house: Internal

* Optimized watching of non-functional properties

## v3.0.0-rc.84 (2020-10-09)

#### :house: Internal

* Optimized creation of watchers of functional components

## v3.0.0-rc.71 (2020-10-01)

#### :bug: Bug Fix

* Fixed a bug with deep watching of props
* Fixed providing of a watch context
* Fixed an invalid caching of old values with `collapse = false`

## v3.0.0-rc.38 (2020-07-21)

#### :bug: Bug Fix

* Fixed caching of old values

## v3.0.0-rc.37 (2020-07-20)

#### :rocket: New Feature

* Added support of mounted watchers

```js
this.$watch(anotherWatcher, () => {
  console.log('...');
});

this.$watch({ctx: anotherWatcher, path: foo}, () => {
  console.log('...');
});
```

#### :bug: Bug Fix

* Fixed memory leak with watchers

#### :house: Internal

* Fixed ESLint warnings
