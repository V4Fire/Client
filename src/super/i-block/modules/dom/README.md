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

Returns a component's instance from the specified element or CSS selector.
There are four scenarios of working the method:

1. You provide the root element of a component, and the method returns a component's instance from this element.
2. You provide not the root element, and the method returns a component's instance from the closest parent component's root element.

```js
console.log(this.dom.getComponent(someElement)?.componentName);
console.log(this.dom.getComponent(someElement, '.b-form')?.componentName);
```

3. You provide the root element of a component, and the method returns a component's instance from this element.
4. You provide not the root element, and the method returns a component's instance from the closest parent
   component's root element.

```js
console.log(this.dom.getComponent('.foo')?.componentName);
console.log(this.dom.getComponent('.foo__bar', '.b-form')?.componentName);
```

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

## localInView

A link to a component' `core/dom/in-view` instance.

## watchForIntersection

Watches for intersections of the specified element by using the `core/dom/in-view` module.
The method returns a link to an `Async` worker that wraps the operation.

You should prefer this method instead of raw `core/dom/in-view` to cancel the intersection observing
when the component is destroyed.

```js
const id = this.watchForIntersection(myElem, {delay: 200}, {group: 'inView'})
this.async.terminateWorker(id);
```

## watchForResize

Watches for size changes of the specified element by using the `core/dom/resize-observer` module.
The method returns a link to an `Async` worker that wraps the operation.

You should prefer this method instead of raw `core/dom/resize-observer` to cancel resize observing
when the component is destroyed.

```js
const id = this.watchForResize(myElem, {immediate: true}, {group: 'resize'})
this.async.terminateWorker(id);
```

## createBlockCtxFromNode

Creates a [[Block]] instance from the specified node and component instance.
Basically, you don't need to use this method.
