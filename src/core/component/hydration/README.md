# core/component/hydration

This module offers an API to store hydrated component data.

```js
import { HydrationStore } from 'core/component';

const hydrationStore = new HydrationStore();

const myComponentId = 'u42';

hydrationStore.set(myComponentId, 'dbStore', {
  someComponentData: 42
});

hydrationStore.set(myComponentId, 'stageStore', 'example');

if (hydrationStore.has(myComponentId)) {
  console.log(hydrationStore.get(myComponentId)); // {dbStore: {someComponentData: 42}, stageStore: 'example'}
}

console.log(hydrationStore.toString()); // {"u42":{"dbStore": {"someComponentData": 42}, "stageStore": "example"}}
```

## Usage

There are two ways to use this API.

### Server-side

In this case, the module's API is used to save component data,
followed by JSON serialization and insertion somewhere in the markup.

Please note that when storing the data,
it is recommended to use the `hydrationStore` field of the component instead of importing it separately.

Also, please keep in mind that serialized data should be placed within a node with the ID `hydration-store`.

### Client-side

In this case, the module will automatically load data from the markup element with the ID `hydration-store`.
Afterward, you will be able to access the saved data for any component by its `componentId`.

### Styles

This store also exports a property called `styles`,
which is a dictionary containing the necessary styles for inline rendering during SSR.
