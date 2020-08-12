Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.60 ()

#### :boom: Breaking Change

* Now all extra classes that were added by using `appendToRootClasses` added to the start of the declaration

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
