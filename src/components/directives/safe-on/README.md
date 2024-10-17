# components/directives/safe-on

[Changelog](./CHANGELOG.md)

This module provides a secure directive that extends the [v-on](https://vuejs.org/api/built-in-directives.html#v-on) attribute in Vue,
preventing handlers from being triggered after the vnode is unmounted.

## Installation

To use the `v-safe-on` directive, simply declare it in your component libs:

```js
package('b-component-name')
  .libs(
		'components/directives/safe-on',
  )
```

## Usage

The directive `v-safe-on:click = handler` is transformed during compilation into `@click = handler | v-safe-on:click` in Snakeskin templates.
You can implement the `v-safe-on` directive in Snakeskin templates as follows:

```
< .&__your-element v-safe-on:click = handleClick
```

It is also possible to use it with dynamic event names:

```
< .&__your-element v-safe-on:[eventName] = handleDynamicEvent
```

## Limitations

However, there are circumstances where this directive cannot be automatically compiled, and the developer must manually declare two fields.
For example, if the directive binding only occurs at runtime, the following will not work:

```
< .&__your-element &
  v-attrs = {
    'v-safe-on:click': 'handleClick',
  }
.

```

Instead, you should do the following:

```
< .&__your-element &
  v-attrs = {
    '@click': 'handleClick',
    'v-safe-on:click': '',
  }
```
