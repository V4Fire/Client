# base/b-virtual-scroll

This module provides a component to render component sequences with the support of lazy loading and dynamically updating.
This component can be very efficient if you need to render a good amount of elements.

### How to use

```
< b-virtual-scroll &
  :dataProvider = 'demo.Pagination' |
  :request = {get: {chunkSize: 12}} |
  :option = 'b-card' |
  :optionKey = (el, i) => resolveKey(el) |
  :optionProps = getPropsForOption |
  :dbConverter = convertDataToVirtual
.
```

The component expects that loaded data will have the structure that matches with the `RemoteData` interface.

```typescript
export interface RemoteData extends Dictionary {
  /**
   * Data to render
   */
  data?: unknown[];

  /**
   * Total number of elements
   */
  total?: number;
}
```

You can use `dbConverter` to convert data to match this interface.

To specify what kind of component to render, you have to use the `option` property.
Mind, the property can be defined as a string or function.

A component that will be rendered is passed to the `option` property, this property can also be a function.

### Events

| EventName     | Description     | Payload description      | Payload  |
| ------------- |---------------- | ------------------------ |--------- |
| dbChange      | This event is called after receiving data from the `dataProvider`.The event will not be triggered if an empty response is received from the server. | An array of all uploaded data | `{data: unknown[]} & Dictionary` |
| dataChange    | This event is called after data batch is filled. | An array of uploaded data for a batch | `unknown[]` |
| chunkLoaded   | This event is called after every successful response from `dataProvider` | Normalized and raw data from `dataProvider` | `LastLoadedChunk` |
| chunkLoading  | This event is called before every trip to the `dataProvider` | Current page | `number` |
