# components/traits/i-observe-dom

This module provides a trait for a component to observe DOM changes by using [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'components/traits';

  import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
  import iBlock, { component, wait } from 'components/super/i-block/i-block';

  interface bExample extends Trait<typeof iObserveDOM> {}

  @component()
  @derive(iObserveDOM)
  class bExample extends iBlock implements iObserveDOM {
    @wait('ready')
    initDOMObservers(): CanPromise<void> {
      iObserveDOM.observe(this, {
        node: this.$el,
        childList: true,
        characterData: false
      });
    }
  }

  export default bExample;
  ```

## Events

| Name                     | Description                              | Payload description                | Payload                                                   |
|--------------------------|------------------------------------------|------------------------------------|-----------------------------------------------------------|
| `localEmitter:DOMChange` | The observable DOM tree has been changed | Mutation records; Observer options | `CanUndef<MutationRecord[]>`; `CanUndef<ObserverOptions>` |

## Methods

The trait specifies a bunch of methods to implement.

### initDOMObservers

Method for initializing observers. The trait provides a static method `observe` to initialize the observer.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });
  }
}
```

### onDOMChange

This method is a handler.
It will be called every time a change occurs.
The list of changes to the observed node will be passed to this method as an argument.

The trait also provides a static method emitDOMChange that emits the `localEmitter:DOMChange` event.
The method has a default implementation.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.prototype.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });
  }

  /** {@link iObserveDOM.onDOMChange} */
  onDOMChange(records: MutationRecord[]): void {
    const
      filtered = iObserveDOM.filterMutations(records, (node) => node instanceof HTMLElement),
      {addedNodes, removedNodes} = iObserveDOM.getChangedNodes(filtered);

    console.log(addedNodes.length, removedNodes.length);
    iObserveDOM.emitDOMChange(this, records);
  }
}
```

## Helpers

The trait provides a bunch of helper functions that are implemented as static methods.

### observe

Starts watching for changes to the DOM of the specified node.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });
  }
}
```

### unobserve

Stops watching for changes to the DOM of the specified node.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });

    iObserveDOM.unobserve(this, content);
  }
}
```

### filterMutations

Filters added and removed nodes.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.prototype.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });
  }

  /** {@link iObserveDOM.onDOMChange} */
  onDOMChange(records: MutationRecord[]): void {
    const filtered = iObserveDOM.filterMutations(records, (node) => node instanceof HTMLElement);
    console.log(filtered)
  }
}
```

### getChangedNodes

This method removes duplicates from `addedNodes` and `removedNodes` arrays.

```typescript
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';
import iBlock, { component, wait } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock implements iObserveDOM {
  /** {@link iObserveDOM.prototype.initDOMObservers} */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    iObserveDOM.observe(this, {
      node: this.$el,
      childList: true,
      characterData: false
    });
  }

  /** {@link iObserveDOM.onDOMChange} */
  onDOMChange(records: MutationRecord[]): void {
    const
      filtered = iObserveDOM.filterMutations(records, (node) => node instanceof HTMLElement),
      {addedNodes, removedNodes} = iObserveDOM.getChangedNodes(filtered);

    console.log(addedNodes.length, removedNodes.length);
  }
}
```

### emitDOMChange

Fires an event that the DOM tree has changed.

### isNodeBeingObserved

Returns `true` if the specified node is being observed via `iObserveDOM`.
