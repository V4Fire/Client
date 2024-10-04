# components/traits/i-data-provider

This module provides a trait for a component to allow it to work with different data providers.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

* The trait additionally implements [[iProgress]].

## Modifiers

| Name       | Description                                                                                                    | Values    | Default |
|------------|----------------------------------------------------------------------------------------------------------------|-----------|---------|
| `progress` | The component in some process: loading data, processing something, etc. Maybe, we need to show a progress bar. | `boolean` | -       |

To support these modifiers, override the `mods` static parameter in your component.

```typescript
import iDataProvider from 'components/traits/i-data-provider/i-data-provider';

export default class bButton implements iDataProvider {
  static override readonly mods: ModsDecl = {
    ...iDataProvider.mods
  };
}
```

## Events

| Name            | Description                                    | Payload description | Payload |
|-----------------|------------------------------------------------|---------------------|---------|
| `progressStart` | The component has started to process something | -                   | -       |
| `progressEnd`   | The component has ended to process something   | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iDataProvider from 'components/traits/i-data-provider/i-data-provider';

export default class bButton implements iDataProvider {
  protected override initModEvents() {
    super.initModEvents();
    iDataProvider.initModEvents(this);
  }
}
```

## Props

The trait specifies a bunch of optional props.

### [dataProviderProp]

The component data provider or its name.
A provider can be specified in several ways: by its name, by its constructor, or simply by passing in an instance of the provider.

```
< b-example :dataProvider = 'myProvider'
< b-example :dataProvider = require('providers/my-provider').default
< b-example :dataProvider = myProvider
```

### [dataProviderOptions]

Additional data source initialization options.
This parameter is used when the provider is specified by name or constructor.

```
< b-example :dataProvider = 'myProvider' | :dataProviderOptions = {socket: true}
```

### [request]

External request parameters.

The object keys are the names of the methods of the data provider.
Parameters associated with provider methods will automatically be added to the call as default parameters.

This option is useful for providing some query options from the parent component.

```
< b-select :dataProvider = 'Cities' | :request = {get: {text: searchValue}}

// Also, you can provide additional parameters to request method
< b-select :dataProvider = 'Cities' | :request = {get: [{text: searchValue}, {cacheStrategy: 'never'}]}
```

### [suspendedRequestsProp = `false`]

If true, all requests to the data provider are suspended till you manually resolve them.
This option is used when you want to lazy load components. For instance, you can only load components in
the viewport.

```
< b-select :dataProvider = 'Cities' | :suspendRequests = true
```

## Fields

The trait specifies a bunch of fields to implement.

### requestParams

Request parameters for the data provider.

The object keys are the names of the methods of the data provider.
Parameters associated with provider methods will automatically be added to the call as default parameters.

To create logic when the data provider automatically reloads the data if some properties have been changed,
you need to use `sync.object`.

```typescript
import iData, { component, system } from 'components/super/i-data/i-data';

@component()
class bExample extends iData {
  @system()
  i: number = 0;

  // {get: {step: 0}, upd: {i: 0}, del: {i: '0'}}
  @system((ctx) => ({
    ...ctx.sync.link('get', [
      ['step', 'i']
    ]),

    ...ctx.sync.link('upd', [
      ['i']
    ]),

    ...ctx.sync.link('del', [
      ['i', String]
    ])
  }))

  protected readonly requestParams!: RequestParams;
}
```

### suspendedRequests

If true, all requests to the data provider are suspended till you manually resolve them.
This parameter must be linked to `suspendedRequestsProp`.

### dataProvider

An instance of the component data provider.

## Methods

The trait specifies a bunch of methods to implement.

### unsuspendRequests

Unsuspends all requests to the data provider.
The method has a default implementation.

You can use `suspendedRequestsProp` and `unsuspendRequests` to lazy load components.
For example, you can only load components in the viewport.

```
< b-example &
  :dataProvider = 'myData' |
  :suspendedRequests = true |
  v-in-view = {
    threshold: 0.5,
    onEnter: (el) => el.node.component.unsuspendRequests()
  }
.
```

### waitPermissionToRequest

Returns a promise that will be resolved when the component can make requests to the data provider.
The method has a default implementation.

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iProgress from 'components/traits/i-progress/i-progress';

export default class bButton implements iProgress {
  protected override initModEvents(): void {
    super.initModEvents();
    iProgress.initModEvents(this);
  }
}
```
