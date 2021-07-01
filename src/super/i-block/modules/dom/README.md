# super/i-block/modules/dom

Class provides helper methods to work with a component' DOM tree.

```js
this.dom.appendChild(parent, newEl);
```

## getId

Takes a string identifier and returns a new identifier that is connected to the component.
This method should use to generate id attributes for DOM nodes.

```
< b-input :id = getId('foo')

< label :for = getId('foo')
  My label
```

## getComponent

Returns an instance of a component from the specified element or by a selector.

## delegate

Wraps the specified function as an event handler with delegation.

```typescript
import iBlock, { component, watch } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  // Adding a listener via the `@watch` decorator
  @watch({
    path: '$el:click',
    wrapper: (ctx, handler) => ctx.dom.delegate('[data-foo="baz"]', handler)
  })

  onClick(e: MouseEvent) {
    console.log(e.delegateTarget);
  }

  mounted() {
    this.$el.addEventListener('click', this.dom.delegate('[data-foo="bar"]', (e: MouseEvent) => {
      // Always refers to the element to which we are delegating the handler
      console.log(e.delegateTarget);
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

## delegateElement

Wraps the specified function as an event handler with delegation of a component element.

```typescript
import iBlock, { component, watch } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  // Adding a listener via the `@watch` decorator
  @watch({
    path: '$el:click',
    wrapper: (ctx, handler) => ctx.dom.delegateElement('user', handler)
  })

  onClick(e: MouseEvent) {
    console.log(e.delegateTarget);
  }

  mounted() {
    this.$el.addEventListener('click', this.dom.delegateElement('item', (e: MouseEvent) => {
      // Always refers to the element to which we are delegating the handler
      console.log(e.delegateTarget);
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

## putInStream

Puts an element to the render stream.
The method forces rendering of the element (by default it uses the root component' element), i.e.,
you can check its geometry.

```js
this.dom.putInStream(() => {
  console.log(this.$el.clientHeight);
});

this.dom.putInStream(this.$el.querySelector('.foo'), () => {
  console.log(this.$el.clientHeight);
})
```

## appendChild

Appends a node to the specified parent.
The method returns a link to an `Async` worker that wraps the operation.

```js
const id = this.dom.appendChild(this.$el, document.createElement('button'));
this.async.terminateWorker(id);
```

## replaceWith

Replaces a component element with the specified node.
The method returns a link to an `Async` worker that wraps the operation.

```js
const id = this.dom.replaceWith(this.block.element('foo'), document.createElement('button'));
this.async.terminateWorker(id);
```
