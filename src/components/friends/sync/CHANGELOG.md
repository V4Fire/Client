Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-??-??)

#### :house: Internal

* Performance improvements

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The module has been moved to`components/friends/sync`
* The module has been rewritten to a new tree-shake friendly API

#### :memo: Documentation

* Added complete documentation for the module

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
