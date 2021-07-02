Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.209 (2021-07-02)

#### :boom: Breaking Change

* Removed ability to send an additional request after a session was cleared (removed a `requestAfterClear` property)
* Sending an additional request after the authorization parameters was changed now has only one attempt
