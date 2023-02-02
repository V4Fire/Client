# core/component/hydration

This module provides a class for storing hydrated component data.
Note that all stored data must be JSON-serializable.

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
