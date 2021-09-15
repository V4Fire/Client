# core/router

This module provides base interfaces and helpers for a router engine and the default implementations of these interfaces.
The engines aren't used directly, but with [[bRouter]].

## Engines

### History API Engine (`browser.history`)

This engine is based on the browser History API. It is hooked with the History API events such as `popstate` and `pageShow` and writes all pages states into the native `history` object.

Use this engine if you need to update a URL after transitions and support of native back/forward actions.

### In-memory Engine

This engine stores all page states completely in memory. It doesn't update a URL after transitions and doesn't support native
back/forward actions. It's useful when you have an embedded resource that shouldn't change the main page navigation state.

Use this engine if you don't care about native browser navigation or avoid changing the global navigation state of the browser tab.
