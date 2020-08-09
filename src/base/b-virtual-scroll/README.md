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

### Events

| EventName     | Description     | Payload description      | Payload  |
| ------------- |---------------- | ------------------------ |--------- |
| dbChange      | The event is fired after receiving data from a data provider. The event won't be fired if the data is empty. | Cumulative data of all tied requests | `RemoteData` |
| dataChange    | The event is fired after changing a data batch | Data batch value | `unknown[]` |
| chunkLoaded   | The event is fired after every successful response from a data provider | A structure with raw and normalized data that takes from a data provider | `LastLoadedChunk` |
| chunkLoading  | The event is fired before start to load data from a data provider | Current page | `number` |
