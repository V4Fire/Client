# base/b-remote-provider

This module provides a component to work with a data provider without visual rendering.
By default, a parent component will wait until this component is resolved the process of loading.
The component can be useful in creating a composition of data.

## Synopsis

* The component extends [[iData]].

* By default, the root tag of the component is `<div>`.

## Events

| EventName     | Description                                            | Payload description                     | Payload                                   |
| ------------- | ------------------------------------------------------ | --------------------------------------- | ----------------------------------------- |
| `change`      | The provider has uploaded and changed data             | Provider data                           | `DB`                                      |
| `addData`     | There have occur adding of new data to the provider    | Data                                    | `unknown`                                 |
| `updData`     | There have occur updating of data of the provider      | Data                                    | `unknown`                                 |
| `delData`     | There have occur deleting of data from the provider    | Data                                    | `unknown`                                 |
| `error`       | There have occur an error with the provider            | Error object; Function to retry request | `Error \| RequestError`; `RetryRequestFn` |

Also, you can see the parent component.

## Usage

Don't use this component if you just want to join several providers into the one `db` object: to do this, you should prefer `extraProviders`.

The valid scenario of using this component is to send data to non-main providers, like, analytics.

```
< b-remote-provider ref = analytics | :dataProvider = 'Analytics'
```

```js
// Somewhere in a parent component
this.$refs.analytics.post({data: [1, 2, 3]});
```

You can also use this component on initializing: you can hook to `@change` event, or provide the `field` prop to store the component `.db` into the parent field.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :field = 'selectedCity'
< b-remote-provider :dataProvider = 'SelectedCity' | @change = initSelectedCity
```

Because this component is a child of [[iData]], you free to use all these props and events.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :request = {get: {lat, lon}}
```

## Slots

The component supports providing the default slot.

```
< b-remote-provider :dataProvider = 'SelectedCity'
  < #template = {db}
    {{ db.value }}
```
