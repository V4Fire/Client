# base/b-virtual-scroll

This module provides a component to render component sequences with the support of lazy loading and dynamically updating.
This component can be very efficient if you need to render a good amount of elements.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iItems]] trait.

* By default, the root tag of the component is `<div>`.

## Events

| EventName        | Description                                                                                                  | Payload description                                                      | Payload                     |
|------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------|
| dbChange         | The event is fired after receiving data from a data provider. The event won't be fired if the data is empty. | Cumulative data of all tied requests                                     | `RemoteData`                |
| dataChange       | The event is fired after changing a data batch                                                               | Data batch value                                                         | `unknown[]`                 |
| chunkLoading     | The event is fired before start to load data from a data provider                                            | Current page                                                             | `number`                    |
| chunkLoaded      | The event is fired after every successful response from a data provider                                      | A structure with raw and normalized data that takes from a data provider | `LastLoadedChunk`, `number` |
| chunkRenderStart | The event is fired before components are rendered                                                            | chunk number                                                             | `number`                    |
| chunkRender      | The event is fired after rendered nodes inserted into DOM                                                    | Render items, chunk number                                               | `RenderItem[]`, `number`    |

Also, you can see the parent component and the component traits.

## Usage

### Basic

```
< b-virtual-scroll &
  :dataProvider = 'demo.Pagination' |
  :request = {get: {chunkSize: 12}} |
  :item = 'b-card' |
  :itemKey = (el, i) => resolveKey(el) |
  :itemProps = getPropsForOption |
  :dbConverter = convertDataToVirtual
.
```

The component expects that loaded data will have the structure that matches with the `RemoteData` interface.

```typescript
export interface RemoteData extends Dictionary {
  /**
   * Data to render
   */
  data?: object[];

  /**
   * Total number of elements
   */
  total?: number;
}
```

You can use `dbConverter` to convert data to match this interface.

To specify what kind of component to render, you have to use the `option` property.
Mind, the property can be defined as a string or function.

### Manual data display control

By default, data is requested and rendered automatically (when scrolling the page), you can override this behavior to load and render data manually.

To set loading and rendering data in manual mode, set the `loadStrategy` prop to `manual`.

```
< b-virtual-scroll &
  :dataProvider = 'demo.Pagination' |
  :dbConverter = convertDataToVirtual |
  :request = {get: {chunkSize: 12}} |
  :loadStrategy = 'manual' |

  :item = 'b-card' |
  :itemKey = (el, i) => resolveKey(el) |
  :itemProps = getPropsForItem |
.
  < template #renderNext = o
    < .&__render-next @click = o.ctx.renderNext
      Render or load next
```

Initial loading and request will be made automatically, but after that `renderNext` method will need to be used to request and render data.

## Slots

The component supports a bunch of slots to provide:

1. `tombstone` This slot is displayed only during data loading, it will be duplicated `chunkSize` number of times.
This slot is great if you want to display skeletons while the component is loading data.

```
< b-virtual-scroll
  < template #tombstone
    < .&__skeleton
```

2. `loader` This slot is displayed only during data loading.
This slot is great if you want to display something while the component is loading data.

```
< b-virtual-scroll
  < template #loader
    < b-loader
```

3. `empty` This slot is displayed if the component has no data at all to render after completing data requests.

```
< b-virtual-scroll
  < template #empty
    < .&__empty
      There is no data to render
```

4. `retry` This slot is displayed if the component data request error occurs.

```
< b-virtual-scroll
  < template #retry = o
    < .&__retry @click = o.ctx.reloadLast
      Retry last request
```

5. `renderNext` This slot is displayed if the component has data to render or requests are not stopped.
This slot can be useful if you want to provide the ability to manually request additional data.

```
< b-virtual-scroll
  < template #retry = o
    < .&__retry @click = o.ctx.renderNext
      Render next
```

6. `done` This slot is displayed if the component rendered and requested all data.

```
< b-virtual-scroll
  < template
    < .&__done
      All data are rendered and requested
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [cacheSize = `400`]

The maximum number of elements to cache.

#### [renderGap = `10`]

Number of elements till the page bottom that should initialize a new render iteration.

#### [chunkSize = `10`]

Number of elements per one render chunk.

#### [tombstonesSize]

Number of tombstones to render.

#### [clearNodes = `false`]

If true, then elements are dropped from a DOM tree after scrolling.
This method is recommended to use if you need to display a huge number of elements and prevent an OOM error.

#### [cacheNodes = `true`]

If true, then created nodes are cached.

#### [requestQuery]

A function that returns parameters to make a request.

#### [getData]

A function to request a new data chunk to render.

#### [shouldMakeRequest]

When this function returns true the component will be able to request additional data.

#### [shouldStopRequest]

When this function returns true the component will stop to request new data.

### Methods

#### reInit

Re-initializes the component.

#### reloadLast

Reloads the last request (if there is no `db` or `options` the method calls reload).

#### renderNext

Tries to render the next data chunk.
The method emits a new request for data if necessary.

#### getCurrentDataState

Returns an object with the current data state of the component.

#### getItemAttrs

Returns additional props to pass to an item component.

#### getItemComponentName

Returns a component name to render an item.
