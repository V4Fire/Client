# components/super/i-block/providers

This module provides an API for initializing and loading external data to a component.

## How a Component Loads Its Data

When a component is created, it calls its `initLoad` method. This method, depending on the component parameters,
can either immediately switch it to `ready` (nothing needs to be loaded), or initialize the loading of resources:
switch the component to the `loading` status, and after all the resources are loaded, switch it to ` ready` and
initialize re-rendering (if necessary).

## API

### Props

#### [dependenciesProp]

An iterable object with additional component dependencies for initialization.

```typescript
import iBlock, { component, Module } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // Asynchronously load the following components
  override dependenciesProp: Iterable<Module> = [
    {name: 'b-button', load: () => import('components/form/b-button')},
    {name: 'b-input', load: () => import('components/form/b-input')}
  ];
}
```

#### [remoteProvider = `false`]

If true, the component is marked as a removed provider.
This means that the parent component will wait for the current component to load.

#### [dontWaitRemoteProvidersProp]

If true, the component will skip waiting for remote providers to avoid redundant re-rendering.
This prop can help optimize your non-functional component when it does not contain any remote providers.
By default, this prop is automatically calculated based on component dependencies.

### Fields

#### dependencies

A list of additional dependencies to load during the component's initialization.
The parameter is tied with the `dependenciesProp` prop.

#### dontWaitRemoteProviders

If true, the component will skip waiting for remote providers to avoid redundant re-rendering.
The parameter is tied with the `dontWaitRemoteProvidersProp` prop.

### Methods

#### initLoad

Loads component initialization data.
The method loads data from external providers (if any), local storage, etc.
It is called when the component is created.

##### Events triggered by the method

| EventName       | Description                             | Payload description                                  | Payload                      |
|-----------------|-----------------------------------------|------------------------------------------------------|------------------------------|
| `initLoadStart` | The component started loading data      | Additional initializing options                      | `InitLoadOptions`            |
| `initLoad`      | The component has finished loading data | Initialization data; Additional initializing options | `unknown`; `InitLoadOptions` |

```typescript
interface InitLoadOptions {
  /**
   * If true, the component is loaded silently, i.e., without switching `componentStatus` to `loading`
   * @default `false`
   */
  silent?: boolean;

  /**
   * If true, the component is forced to load/reload all child components
   * @default `false`
   */
  recursive?: boolean;

  /**
   * If false, then the data loading start event won't be fired
   * @default `true`
   */
  emitStartEvent?: boolean;
}
```

#### reload

Reloads component providers: the method delegates functionality to the `initLoad` method.
By default, the reboot will run in silent mode, i.e., without switching the component status to `loading`.
You can customize this behavior by passing additional parameters.

#### createDataProviderInstance

Creates an instance of the DataProvider based on the specified parameters.
