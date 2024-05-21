# core/component/client-state

The module provides a global store for all components to access,
which can be used to provide data from external modules to components.
The store is similar to Redux, but much simpler and easier to use.
Components can subscribe to the store to receive updates whenever the data in the store changes,
and they can also update the store themselves if necessary.
This allows for a centralized location for managing data that can be accessed by all components throughout
the application.

## Usage

```js
import state, { watch, set, unset } from 'core/component/client-state';

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

V4Fire supports out-of-the-box integration with the `core/session`, `core/net`, and `core/abt` modules.

### state.isAuth

This property signifies if the session has been authorized or not.

### state.isOnline

This property signifies if an Internet connection is currently active or not.

### state.lastOnlineDate

This property indicates the date of the most recent Internet connection.

### state.lang

The application default language.

### state.experiments

This property contains a list of registered AB experiments.

### state.cookies

This property contains a store of application cookies.

### state.document

This property contains a shim for the `window.document` API.

### state.globalEnv

An object whose properties will extend the global object.
Using this object, polyfills for all necessary APIs can be passed through.

## API

By default, this module exports a link to the store object itself.
Additionally, it provides methods for setting and unsetting new store properties, as well as watching for changes.
To observe store modifications, the module utilizes the `core/watch` functionality.
For a comprehensive understanding of object observation, please consult the documentation for this module.
