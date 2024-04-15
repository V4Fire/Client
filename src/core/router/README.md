# core/router

This module provides the base interfaces and helpers for the router engine, as well as the default implementations of those interfaces.
Engines are not used directly, but with [[bRouter]].

## Built-in Engines

### History API Engine (`engines/browser-history`)

This engine is based on the History API. It listens to History API events such as `popstate` and `pageShow` and records
all page states in its own `history` object. Use this engine if you need to update the URL after navigation and support back/forward actions.

### In-memory Engine (`engines/in-memory`)

This engine keeps all page states completely in memory. It doesn't update the URL after transitions and doesn't support native
back/forward actions. This is useful when you have an embedded resource that shouldn't change the master page navigation state.
Use this engine if you don't need your own navigation in the browser, or you avoid changing the global state of navigation in a browser tab.

### SSR Engine (`engines/ssr`)

This engine is designed to be used with SSR.
