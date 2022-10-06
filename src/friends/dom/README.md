# friends/dom

This module provides a class for low-level working with a component DOM tree.

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `dom` property.
Some methods, such as `getId` are always available, and the rest must be included explicitly to enable tree-shake code
optimization. Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import DOM, { appendChild, getComponent } from 'friends/dom';

// Import `appendChild` and `getComponent` methods
DOM.addToPrototype(appendChild, getComponent);

@component()
export default class bExample extends iBlock {}
```

## Methods

## getId

Takes a string identifier and returns a new identifier associated with the component.
This method should use to generate id attributes for DOM nodes.
This method is plugged by default.

```
< b-input :id = getId('foo')

< label :for = getId('foo')
  My label
```

## getComponent

Returns a component instance that is associated with the given DOM element or selector.

```js
console.log(this.dom.getComponent(someElement)?.componentName);
console.log(this.dom.getComponent(someElement, '.b-form')?.componentName);

console.log(this.dom.getComponent('.foo')?.componentName);
console.log(this.dom.getComponent('.foo__bar', '.b-form')?.componentName);
```

## delegate

Wraps the specified function as an event handler with delegation.
In simple terms, the wrapped function will be executed only if the event happened on the element by the given
selector or in its descendant node. Also, the function adds to the event object a reference to the element to which
the selector is specified.

```typescript
import iBlock, { component, watch } from 'super/i-block/i-block';
import DOM, { delegate } from 'friends/dom';

DOM.addToPrototype(delegate);

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
      console.log(e.delegateTarget);
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

## delegateElement

Wraps the specified function as an event handler with component element delegation.
In simple terms, the wrapped function will be executed only if the event happened on the element by the name or
in its descendant node. Also, the function adds to the event object a reference to the element to which the selector
is specified.

```typescript
import iBlock, { component, watch } from 'super/i-block/i-block';
import DOM, { delegateElement } from 'friends/dom';

DOM.addToPrototype(delegateElement);

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
      console.log(e.delegateTarget);
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

## renderTemporarily

Forces the given element to be rendered into the DOM so that its geometry and other properties can be retrieved.
After rendering, the specified callback function will be called, and then the element will return to its original state.

```js
this.dom.renderTemporarily(() => {
  console.log(this.$el.clientHeight);
});

this.dom.renderTemporarily(this.$el.querySelector('.foo'), () => {
  console.log(this.$el.clientHeight);
})
```

## appendChild

Appends the specified DOM node to the passed parent node.
The function returns a destructor to remove the appended node from the DOM.

This method should be preferred over native DOM methods because the component destructor does not remove dynamically
created elements.

```js
const removeFromDOM = this.dom.appendChild(this.$el, document.createElement('button'));
removeFromDOM();
```

## replaceWith

Replaces the specified component element with the passed DOM node.
The function returns a destructor to remove the appended node from the DOM.

This method should be preferred over native DOM methods because the component destructor does not remove dynamically
created elements.

```js
const removeFromDOM = this.dom.replaceWith(this.block.element('foo'), document.createElement('button'));
removeFromDOM();
```

## watchForIntersection

Tracks the intersection of the passed element with the viewport by using the `core/dom/intersection-watcher` module,
and invokes the specified handler each time the element enters the viewport.
The function returns a destructor to cancel the watching.

```js
const unwatch = this.watchForIntersection(myElem, {delay: 200, group: 'inView'});
unwatch();
```

## watchForResize

Watches for the size of the given element by using the `core/dom/resize-observer` module and invokes the specified handler when it changes.
The function returns a destructor to cancel the watching.

Note, changes occurring at the same tick are merged into one.
You can disable this behavior by passing the `immediate: true` option.

```js
const unwatch = this.watchForResize(myElem, {immediate: true, group: 'resize'});
unwatch();
```
