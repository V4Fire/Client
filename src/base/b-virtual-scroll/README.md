# base/b-virtual-scroll

This module provides a component to render a large number of elements with Vue.

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

The `b-virtual-scroll` component always expects a specific data format, or rather,` db` must always be an object
with a field `data` which contains an array of data, so it is recommended to use` dbConverter` to convert
data in a format suitable for `b-virtual-scroll`.

A component that will be rendered is passed to the `option` property, this property can also be a function.

### Events

| EventName        | Description     | Payload description      | Payload  |
| ------------- |-------------| -----|---|
| dbChange | This event is called after receiving data from the `dataProvider`. The event will not be triggered if an empty response is received from the server. | An array of all uploaded data. | `unknown[]` |
| dataChange | This event is called after the trips to the `dataProvider` for one chunk are completed.| An array of uploaded data for the chunk. | `unknown[]` |
| chunkLoaded | This event is called after every successful response from `dataProvider` | Normalized and raw data from `dataProvider` | `LastLoadedChunk` |
| chunkLoading | This event is called before every trip to the `dataProvider` | Current page | `number` |
