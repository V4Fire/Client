Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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
