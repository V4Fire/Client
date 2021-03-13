# traits/i-observe-dom

This module provides a trait for a component to observe DOM changes by using [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

## Events

| Name                     | Description                                                  | Payload description                | Payload                                                   |
| ------------------------ | ------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------- |
| `DOMChange`              | The observable DOM tree was changed. (deprecated!)           | Mutation records, observer options | `CanUndef<MutationRecord[]>`, `CanUndef<ObserverOptions>` |
| `localEmitter:DOMChange` | The observable DOM tree was changed.                         | Mutation records, observer options | `CanUndef<MutationRecord[]>`, `CanUndef<ObserverOptions>` |

## API

A class that implements this trait must implement 2 methods.

### initDOMObservers

In this method, the observer should be initialized. `iObserveDOM` provides a static method `observe` to initialize an observer.

```typescript
@component()
export default class component extends iBlock implements iObserveDOM {
  /** @see [[iObserveDOM.prototype.initDOMObservers]] */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    const
      content = <HTMLElement>this.content;

    iObserveDOM.observe(this, {
      node: content,
      childList: true,
      characterData: false
    });
  }
}
```

### onDOMChange

This method is a handler. Every time a change occurs, the handler will be called, and changes in the DOM tree will be provided into this method.
`iObserveDOM` provides a static method `emitDOMChange` that will emit `localEmitter:DOMChange` event.

```typescript
@component()
export default class component extends iBlock implements iObserveDOM {
  /** @see [[iObserveDOM.prototype.initDOMObservers]] */
  @wait('ready')
  initDOMObservers(): CanPromise<void> {
    const
      content = <HTMLElement>this.content;

    iObserveDOM.observe(this, {
      node: content,
      childList: true,
      characterData: false
    });
  }

  /** @see [[iObserveDOM.prototype.onDOMChange]] */
  onDOMChange(records: MutationRecord[]): void {
    const
      filtered = iObserveDOM.filterNodes(records, (node) => node instanceof HTMLElement),
      {addedNodes, removedNodes} = iObserveDOM.getChangedNodes(filtered);

    this.contentLengthStore += addedNodes.length - removedNodes.length;
    iObserveDOM.emitDOMChange(this, records);
  }
}
```

## Helpers

The trait provides a bunch of helper functions that implemented as static methods.

### unobserve

This method is useful when you need to stop observation on a specific node.

### filterNodes

This method is useful when you need to filter `addedNodes` and `removedNodes` via the filter function.

```typescript
const
      filtered = iObserveDOM.filterNodes(records, (node) => node instanceof HTMLElement)
```

### getChangedNodes

This method removes duplicates from `addedNodes` and `removedNodes` arrays.

```typescript
const
  filtered = iObserveDOM.filterNodes(records, (node) => node instanceof HTMLElement),
  {addedNodes, removedNodes} = iObserveDOM.getChangedNodes(filtered);
```

### emitDOMChange

This method emits an `localEmitter:DOMChange` event.

### isNodeBeingObserved

This method returns `true` if the specified node is being observed via `iObserveDOM`.
