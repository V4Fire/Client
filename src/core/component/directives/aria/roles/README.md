# core/component/directives/aria/roles

This module re-exports implementations of various ARIA roles for the `v-aria` directive,
and also provides a basic set of types and interfaces for adding new roles.

## List of supported roles

Each role is named after the appropriate name from the ARIA specification.
Each role can accept its own set of options, which are described in its documentation.

* [Combobox](https://www.w3.org/TR/wai-aria/#combobox)
* [Dialog](https://www.w3.org/TR/wai-aria/#dialog)
* [Listbox](https://www.w3.org/TR/wai-aria/#listbox)
* [Option](https://www.w3.org/TR/wai-aria/#option)
* [Tab](https://www.w3.org/TR/wai-aria/#tab)
* [Tablist](https://www.w3.org/TR/wai-aria/#tablist)
* [Tabpanel](https://www.w3.org/TR/wai-aria/#tabpanel)
* [Tree](https://www.w3.org/TR/wai-aria/#tree)
* [Treeitem](https://www.w3.org/TR/wai-aria/#treeitem)
* [Controls](https://www.w3.org/TR/wai-aria/#aria-controls)

## Adding handlers for a role

Some roles need to handle component state changes or respond to certain events (add, remove, or change certain attributes).
Such handlers are specified as regular directive parameters, but with the special character `@` added to the beginning of the parameter names.
The value of such parameters can be different types of data.

### Listening a component event

If you pass a string as the value of a handler parameter, then that string will be treated as the name of the component event.
When such an event fires, the corresponding role method will be called, where the `@` symbol is replaced with `on` and
everything is translated into camelCase. For instance, the `@change` key means calling the `onChange` method on the role.
The called method will receive the event parameters as arguments.

```
< div v-aria:somerole = {'@change': 'myComponentEvent'}
```

### Handling a promise

If you pass a promise as the value of a handler parameter, then when this promise is resolved, the corresponding role method
will be called, where the `@` character is replaced with `on`, and everything is converted to camelCase. For instance,
the `@change` key means calling the `onChange` method on the role. The called method will receive the unwrapped promise value
as an argument.

```
< div v-aria:somerole = {'@change': myComponentPromise}
```

### Providing a callback

If you pass a function, it will be called immediately and will receive as a parameter a reference to the corresponding role method,
where the `@` character is replaced with `on` and everything is converted to camelCase. For instance,
the `@change` key means calling the `onChange` method on the role. This approach is the most flexible, because allows you
to register any handlers in this way.

```
< div v-aria:somerole = {'@change': (cb) => on('event', cb)}

// Similar to

< div v-aria:somerole = {'@change': 'event'}
```
