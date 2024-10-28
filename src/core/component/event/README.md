# core/component/event

This module provides a global event emitter for all components
and exposes a variety of helper functions to implement and work with the component event API.
Developers can use the global emitter to provide events from external modules to components,
thereby enabling components to respond to events and interact with other parts of the application.

## Usage

```js
import { emitter, reset } from 'core/component/event';

// This event can be listened to from any component
emitter.emit('reloadAllComponents');

// This is a helper function that can be used to trigger a special event for resetting component storages
reset('storage.silence');
```

## Built-in events

V4Fire provides out of the box integration with `core/session`, `core/net` and `core/i18n` modules.
This integration enables developers to easily incorporate these modules into their applications without
requiring additional configuration or setup.

### i18n.setLocale

This event is triggered when there is a change in the language locale of the application.
See the `core/i18n` module for details.

### i18n.setRegion

This event is triggered when there is a change in the region of the application.
See the `core/i18n` module for details.

### net.status

This event is triggered whenever there is a change in the status of the Internet connection.
See the `core/net` module for details.

### session.set

This event is triggered whenever there is a change in the authorization status of a user session that is
currently active within the application.
See the `core/session` module for details.

### session.clear

This event is triggered when an active user session within the application is reset.
See the `core/session` module for details.

## API

### Constants

#### emitter

This event emitter is used to broadcast various external events from modules to a unified event bus for components.

```js
import { globalEmitter } from 'core/component/event';

globalEmitter.emit('reloadAllComponents', {provider: true, storage: true});
```

#### initEmitter

This event emitter is used to broadcast components' initialization events.

### Functions

#### destroyApp

The directive emits a special event to completely destroy the entire application by its root component's identifier.
This method is typically used in conjunction with SSR.

```js
import { destroyApp } from 'core/component/event';

destroyApp(rootComponentId);
```

#### resetComponents

The method emits a special event to reset components' state to its default settings.
By default, this event triggers a complete reload of all providers and storages bound to components.
Additionally, you can choose from several types of component resets:

1. `'load'` - reloads all data providers bound to components;
2. `'load.silence'` - reloads all data providers bound to components without changing components' statuses to `loading`;

3. `'router'` - resets all components' bindings to the application router;
4. `'router.silence'` - resets all components' bindings to the application router without changing components' statuses to `loading`;

5. `'storage'` - reloads all storages bound to components;
6. `'storage.silence'` - reload all storages bound to components without changing components' statuses to `loading`;

7. `'silence'` - reloads all providers and storages bound to components without changing components' statuses to `loading`.

```js
import { resetComponents } from 'core/component/event';

resetComponents('load');
resetComponents('storage.silence');
```

#### implementEventEmitterAPI

The method implements the event emitter interface for a given component.
The interface includes methods such as `on`, `once`, `off`, and `emit`.
All event handlers are proxied by a component internal [[Async]] instance.
