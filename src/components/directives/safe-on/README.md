# components/directives/safe-on

[Changelog](./CHANGELOG.md)

This module provides a directive that ensures event listeners are only active while the component is alive, preventing handlers from being called after the component is destroyed.
This is a secure alternative to [v-on](https://vuejs.org/api/built-in-directives.html#v-on).

## Installation

To use the `v-safe-on` directive, simply declare it in your component libs:

```js
package('b-component-name')
  .libs(
		'components/directives/safe-on',
  )
```

## Usage

You can use the `v-safe-on` directive in Snakeskin templates like this:

```
< .&__your-element v-safe-on:click = handleClick
```

Also you can use it with dynamic event names:

```
< .&__your-element v-safe-on:[eventName] = handleDynamicEvent
```
