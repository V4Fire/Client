Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.71 (2020-10-01)

#### :bug: Bug Fix

* Fixed a bug with deep watching of props
* Fixed providing of a watch context

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
