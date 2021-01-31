# traits/i-observe-dom

This module provides a trait for a component to observe DOM changes by using [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

## Events

| Name            | Description                                    | Payload description                | Payload                                                   |
| ----------------| ---------------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `DOMChange`     | The observable DOM tree was changed.           | Mutation records, observer options | `CanUndef<MutationRecord[]>`, `CanUndef<ObserverOptions>` |

## Usage

```typescript
@component()
export default class component extends iBlock implements iObserveDOM {
  /** @see iObserveDom.initDOMObservers */
  @wait('loading')
  initDOMObservers(): CanPromise<void> {
    const
      content = <HTMLElement>this.content;

    iObserveDOM.observe(this, {
      node: content,
      childList: true,
      characterData: false
    });
  }

  /** @see iObserveDom.onDOMChange */
  onDOMChange(records: MutationRecord[]): void {
    const
      filtered = iObserveDOM.filterNodes(records, (node) => node instanceof HTMLElement),
      {addedNodes, removedNodes} = iObserveDOM.getChangedNodes(filtered);

    this.contentLengthStore += addedNodes.length - removedNodes.length;
    iObserveDOM.onDOMChange(this, records);
  }
}
```