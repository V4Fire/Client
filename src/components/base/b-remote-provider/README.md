# components/base/b-remote-provider

This module offers a component designed to interact with a data provider without any visual rendering.
By default, the parent component will wait for this component to complete the loading process.
This component can be particularly beneficial when creating data compositions.

## Synopsis

* The component extends [[iData]].

* The component lacks a default user interface.

* By default, the component's root tag is set to `<div>`.

## Events

| EventName    | Description                                    | Payload description                         | Payload                                   |
|--------------|------------------------------------------------|---------------------------------------------|-------------------------------------------|
| `change`     | The provider has uploaded and changed the data | Data                                        | `DB`                                      |
| `addData`    | New data has been added to the provider        | Data                                        | `unknown`                                 |
| `updateData` | The provider's data has been updated           | Data                                        | `unknown`                                 |
| `deleteData` | The provider's data has been deleted           | Data                                        | `unknown`                                 |
| `error`      | An error has occurred with the provider        | Error object; Function to retry the request | `Error  │ RequestError`; `RetryRequestFn` |

Also, you can see the parent component.

## Usage

Avoid using this component if your goal is to merge multiple providers into a single database object.
Instead, opt for `extraProviders`.
A suitable use case for this component would be transmitting data to non-primary providers, such as analytics systems.

```
< b-remote-provider ref = analytics | :dataProvider = 'Analytics'
```

```js
// Within the parent component
this.$refs.analytics.post({data: [1, 2, 3]});
```

You can also utilize this component during initialization: either by hooking into the `@change` event
or by providing a `field` prop to store the `db` component within the parent field.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :field = 'selectedCity'
< b-remote-provider :dataProvider = 'SelectedCity' | @change = initSelectedCity
```

Since this component inherits from [[iData]],
you have the flexibility to utilize all of its associated props and events.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :request = {get: {lat, lon}}
```

## Slots

The component also supports the provision of a `default` slot.

```
< b-remote-provider :dataProvider = 'SelectedCity'
  < template #default = {db}
    {{ db.value }}
```

## API

Additionally, you can view the implemented traits or the parent component.

### Props

#### [fieldProp]

A path to the field in the parent component where you want to store the loaded data.

```
< b-remote-provider :dataProvider = 'SelectedCity' | :field = 'selectedCity'
```

### Getters

#### content

A list of the component's child nodes.
