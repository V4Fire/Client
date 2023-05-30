# core/component/state

The module provides the global watchable store for all components. You could say it’s like Redux, only much simpler.
Use this store to provide data of external modules to components.

## Usage

```js
import state, { watch, set, unset } from 'core/component/state';

// Online status check
console.log(state.isOnline);

// Watching the session
watch('isAuth', (value, oldValue) => {
  console.log(value, oldValue);
});

// Addin a new property to the state
set('newProp', someValue);
```

## Built-in state

V4Fire supports out of the box integration with `core/session`, `core/net` and `core/abt` modules.

### state.isAuth

The property indicates whether the session is authorized or not.

### state.isOnline

The property indicates whether there is currently an Internet connection or not.

### state.lastOnlineDate

The property indicates the date of the last Internet connection.

### state.experiments

The property refers to a list of registered AB experiments.

## API

As the default export, the module exposes a link to the store object itself.
Besides, the module exports methods to `set`/`unset` new store properties and `watch` for them changes.
To watch the store changes, it uses `core/watch`. Therefore, for detailed information about observing objects,
please refer to the documentation of this module.
