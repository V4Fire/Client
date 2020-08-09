Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

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
