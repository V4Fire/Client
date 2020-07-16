Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.37 ()

#### :rocket: New Feature

* Added support for remote watchers

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
