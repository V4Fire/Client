# core/component/directives/aria/roles-engines/combobox

This module provides engines for `v-aria` directive.

## API

Some roles need to handle components state changes or react to some events (add, delete or change certain attributes).
The fields in directive passed options which name starts with `@` respond for this (ex. `@change`, `@open`).
The certain contract should be followed:
the name of the callback, which should be 'connected' with such field should start with `on` and be named in camelCase style (ex. `onChange`, `onOpen`).

Directive supports this field type to be function, promise or string (type [`HandlerAttachment`](`core/component/directives/aria/roles-engines/interface.ts`)).
- Function:
expects a callback to be passed.
In this function callback could be added as a listener to certain component events or provide to the callback some component's state.

```
< div v-aria:somerole = {'@change': (cb) => on('event', cb)}
```

- Promise:
If the field is a `Promise` or a `PromiseLike` object the callback would be passed to `then`.

- String:
If the field is a `string`, the callback would be added as a listener to component's event similar to the string.

```
< div v-aria:somerole = {'@change': 'event'}

// the same as

< div v-aria:somerole = {'@change': (cb) => on('event', cb)}
```
