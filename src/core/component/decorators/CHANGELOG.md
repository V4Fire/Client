Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.138.dsl-speedup (2024-10-01)

#### :rocket: New Feature

* Added the `test` parameter for fine-tuning watchers

#### :house: Internal

* Performance improvements

## v4.0.0-beta.121.the-phantom-menace (2024-08-05)

#### :rocket: New Feature

* Added the `forceUpdate: false` property to designate props whose changes should not lead to a template re-render

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Removed the `p` decorator

#### :rocket: New Feature

* Added a new cache type `auto` for accessors

#### :memo: Documentation

* Added complete documentation for the module

#### :house: Internal

* Refactoring

## v3.47.4 (2023-05-29)

#### :bug: Bug Fix

* Fixed a bug when observing fields that are redefined from props

## v3.47.2 (2023-05-18)

#### :bug: Bug Fix

* Fixed a bug when the overridden getter with cache had a value equal to the parent's getter value

## v3.0.0-rc.199 (2021-06-16)

#### :bug: Bug Fix

* Fixed a bug when the `cache: false` predicate is ignored if provided `dependencies`

## v3.0.0-rc.88 (2020-10-13)

#### :rocket: New Feature

* Added `functionalWatching` to field decorators

## v3.0.0-rc.84 (2020-10-09)

#### :house: Internal

* Now all tied fields are collected within `meta.tiedFields`

## v3.0.0-rc.37 (2020-07-20)

#### :boom: Breaking Change

* Now all accessors with dependencies are cacheable by default

#### :rocket: New Feature

* Added support of mounted watchers

```js
class bFoo {
  @computed({watchable: true})
  get remoteState(): typeof anotherWatcher {
    return anotherWatcher;
  }
}
```

#### :house: Internal

* Fixed ESLint warnings
