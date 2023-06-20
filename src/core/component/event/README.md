# core/component/event

This module provides a global event emitter for all components
and exposes a variety of helper functions to implement and work with the component event API.
Developers can use the global emitter to provide events from external modules to components,
thereby enabling components to respond to events and interact with other parts of the application.

## Usage

```js
import { emitter, reset } from 'core/component/event';

// This event can be listen from any component
emitter.emit('reloadAllComponents');

// The helper function to fire the special event to reset components storages
reset('storage.silence');
```

## Built-in events

V4Fire provides out of the box integration with `core/session`, `core/net` and `core/i18n` modules.
This integration enables developers to easily incorporate these modules into their applications without
requiring additional configuration or setup.

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

The event emitter to broadcast external events to components.

```js
import { globalEmitter } from 'core/component/event';

globalEmitter.emit('reloadAllComponents', {provider: true, storage: true});
```

#### initEmitter

The event emitter to broadcast component initialization events.

### Functions

#### resetComponents

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
