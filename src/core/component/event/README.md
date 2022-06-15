# core/component/event

This module provides the global event emitter for all components. Use this emitter to provide events of external modules to components.
Also, this module exposes a bunch of helper functions to implement and work with the component event API.

## Usage

```js
import { emitter, reset } from 'core/component/event';

// This event can be listen from any component
emitter.emit('reloadAllComponents');

// The helper function to fire the special event to reset components storages
reset('storage.silence');
```

## Built-in events

V4Fire supports out of the box integration with `core/session`, `core/net` and `core/i18n` modules.

### i18n.setLocale

This event fires when the application's global locale changes.
See the `core/i18n` module for details.

### net.status

This event fires when the Internet connection status changes.
See the `core/net` module for details.

### session.set

This event fires when the authorization status of an active user session changes.
See the `core/session` module for details.

### session.clear

This event fires when an active user session is reset.
See the `core/session` module for details.

## API

### Constants

#### emitter

An event emitter to broadcast external events to components.

```js
import { emitter } from 'core/component/event';

emitter.emit('reloadAllComponents', {provider: true, storage: true});
```

### Functions

#### reset

Emits the special event for all component to reset the passed component state.
By default, this means a complete reload of all providers and storages bound to components.
Also, you can provide one of several types of component resets:

1. `'load'` - reloads all data providers bound to components;
2. `'load.silence'` - reloads all data providers bound to components,
   but without changing components statuses to `loading`;

3. `'router'` - resets all component bindings to the application router;
4. `'router.silence'` - resets all component bindings to the application router,
   but without changing components statuses to `loading`;

5. `'storage'` - reloads all storages bound to components;
6. `'storage'` - reloads all storages bound to components,
   but without changing components statuses to `loading`;

7. `'silence'` - reloads all providers and storages bound to components,
   but without changing components statuses to `loading`.

```js
import { reset } from 'core/component/event';

reset('load');
reset('storage.silence');
```

#### implementEventEmitterAPI

Implements event emitter API for the specified component instance.
