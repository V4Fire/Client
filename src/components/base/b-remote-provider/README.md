# components/base/b-remote-provider

This module provides a component for working with a data provider without visual rendering.
By default, the parent component will wait for that component to resolve the loading process.
This component can be useful when creating data composition.

## Synopsis

* The component extends [[iData]].

* The component does not have the default UI.

* By default, the root tag of the component is `<div>`.

## Events

| EventName | Description                                         | Payload description                     | Payload                                   |
|-----------|-----------------------------------------------------|-----------------------------------------|-------------------------------------------|
| `change`  | The provider has uploaded and changed data          | Provider data                           | `DB`                                      |
| `addData` | There have occur adding of new data to the provider | Data                                    | `unknown`                                 |
| `updData` | There have occur updating of data of the provider   | Data                                    | `unknown`                                 |
| `delData` | There have occur deleting of data from the provider | Data                                    | `unknown`                                 |
| `error`   | There have occur an error with the provider         | Error object; Function to retry request | `Error  │ RequestError`; `RetryRequestFn` |

Also, you can see the parent component.

## Usage

Don't use this component if you just want to combine multiple providers into a single `db` object: you should prefer `extraProviders` for that.

A valid use case for this component is to send data to non-primary providers such as analytics.

```
< b-remote-provider ref = analytics | :dataProvider = 'Analytics'
```

```js
// Somewhere in the parent component
this.$refs.analytics.post({data: [1, 2, 3]});
```

You can also use this component on initialization: you can hook into the `@change` event, or provide a `field` prop to store the `db` component in the parent field.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :field = 'selectedCity'
< b-remote-provider :dataProvider = 'SelectedCity' | @change = initSelectedCity
```

Because this component inherits from [[iData]], you are free to use all of these props and events.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :request = {get: {lat, lon}}
```

## Slots

The component supports providing the `default` slot.

```
< b-remote-provider :dataProvider = 'SelectedCity'
  < #template = {db}
    {{ db.value }}
```

## API

Also, you can see the implemented traits or the parent component.

### Getters

#### content

A list of the component child nodes.
