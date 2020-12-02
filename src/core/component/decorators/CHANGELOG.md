Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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
