# core/component/hydration

This module offers an API to store hydrated component data.

```js
import { hydrationStore } from 'core/component';

const myComponentId = 'uid-42';

hydrationStore.set(myComponentId, 'dbStore', {
  someComponentData: 42
});

hydrationStore.set(myComponentId, 'stageStore', 'example');

if (hydrationStore.has(myComponentId)) {
  console.log(hydrationStore.get(myComponentId)); // {dbStore: {someComponentData: 42}, stageStore: 'example'}
}

console.log(hydrationStore.toString()); // {"uid-42":{"dbStore": {"someComponentData": 42}, "stageStore": "example"}}
```

## Usage

There are two ways to use this API.

### Server-side

In this case, the module's API is used to save component data,
followed by JSON serialization and insertion somewhere in the markup.
Note that the element containing the data must have the ID `hydration-store`.

### Client-side

In this case, the module will automatically load data from the markup element with the ID `hydration-store`.
Afterward, you will be able to access the saved data for any component by its `componentId`.
