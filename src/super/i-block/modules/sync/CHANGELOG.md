Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.211 (2021-07-21)

#### :bug: Bug Fix

* Fixed a bug when mutations of the nested path can't be caught

## v3.0.0-rc.137 (2021-02-04)

#### :rocket: Bug Fix

* Fixed linking of values with watchable prototypes

## v3.0.0-rc.37 (2020-07-20)

#### :rocket: New Feature

* Added support of mounted watchers

```js
this.sync.link(anotherWatcher, () => {
  console.log('...');
});

this.sync.object('foo', [
  ['bla', {ctx: anotherWatcher, path: 'bar'}]
]);
```

#### :house: Internal

* Fixed ESLint warnings
