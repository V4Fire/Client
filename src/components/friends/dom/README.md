# components/friends/dom

This module provides a class for low-level operations with a component's DOM tree.

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `dom` property.
Some methods, such as `getId` and `unwrapId`, are always available,
while the rest must be included explicitly to enable tree-shake code optimization.
Simply place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import DOM, { appendChild, getComponent } from 'components/friends/dom';

// Import `appendChild` and `getComponent` methods
DOM.addToPrototype({appendChild, getComponent});

@component()
export default class bExample extends iBlock {}
```

## Methods

### getId

This method takes a string identifier and returns a new identifier associated with the component.
It should be used to generate id attributes for DOM nodes.
This method is included by default.

```
< b-input :id = getId('foo')

< label :for = getId('foo')
  My label
```

### unwrapId

Takes an identifier produced by `getId` and unwraps it to the original identifier.

```js
const wrappedId = this.dom.getId('bla'); // '{prefix}-bla'
this.dom.unwrapId(wrappedId); // 'bla'
```

### getComponent

Returns a component instance that is associated with the given DOM element or selector.

```js
console.log(this.dom.getComponent(someElement)?.componentName);
console.log(this.dom.getComponent(someElement, '.b-form')?.componentName);

console.log(this.dom.getComponent('.foo')?.componentName);
console.log(this.dom.getComponent('.foo__bar', '.b-form')?.componentName);
```

```
< b-example
  < button :-foo = "baz"
  < button :-foo = "bar"
```

### delegate

This method wraps the specified function as an event handler with delegation.
In simpler terms, the wrapped function will only be executed if the event occurs on the element specified by the given
selector or on its descendant node.
Additionally, the method adds a reference to the element to which the selector is specified within the event object.

```typescript
import iBlock, { component, watch } from 'components/super/i-block/i-block';
import DOM, { delegate } from 'components/friends/dom';

DOM.addToPrototype({delegate});

@component()
export default class bExample extends iBlock {
  // Adding a listener via the `@watch` decorator
  @watch({
    path: '$el:click',
    wrapper: (ctx, handler) => ctx.dom.delegate('[data-foo="baz"]', handler)
  })

  onClick(e: MouseEvent) {
    console.log(e.delegateTarget); // button[data-foo="baz"]
  }

  mounted() {
    this.$el.addEventListener('click', this.dom.delegate('[data-foo="bar"]', (e: MouseEvent) => {
      console.log(e.delegateTarget); // button[data-foo="bar"]
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

### delegateElement

This method wraps the specified function as an event handler with component element delegation.
In simpler terms, the wrapped function will only be executed if the event occurs on the element with the given name or
on its descendant node.
Additionally, the method adds a reference to the element to which the selector is specified within the event object.

```
< b-example
  < button.&__item
  < button.&__user
```

```typescript
import iBlock, { component, watch } from 'components/super/i-block/i-block';
import DOM, { delegateElement } from 'components/friends/dom';

DOM.addToPrototype({delegateElement});

@component()
export default class bExample extends iBlock {
  // Adding a listener via the `@watch` decorator
  @watch({
    path: '$el:click',
    wrapper: (ctx, handler) => ctx.dom.delegateElement('user', handler)
  })

  onClick(e: MouseEvent) {
    console.log(e.delegateTarget); // button.b-example__user
  }

  mounted() {
    this.$el.addEventListener('click', this.dom.delegateElement('item', (e: MouseEvent) => {
      console.log(e.delegateTarget); // button.b-example__item
      console.log(e.currentTarget === this.$el);
    }))
  }
}
```

### renderTemporarily

Forces the given element to be rendered in the DOM so that its geometry and other properties can be retrieved.
After rendering, the specified callback function will be called, and the element will return to its original state.

```js
this.dom.renderTemporarily(() => {
  console.log(this.$el.clientHeight);
});

this.dom.renderTemporarily(this.$el.querySelector('.foo'), () => {
  console.log(this.$el.clientHeight);
})
```

### appendChild

Appends the specified DOM node to the given parent node.
The function returns a destructor to remove the appended node from the DOM.

This method should be preferred over native DOM methods because the component destructor does not remove dynamically
created elements.

```js
const removeFromDOM = this.dom.appendChild(this.$el, document.createElement('button'));

removeFromDOM();
```

### replaceWith

Replaces the specified component element with the given DOM node.
The function returns a destructor to remove the appended node from the DOM.

This method should be preferred over native DOM methods because the component destructor does not remove dynamically
created elements.

```js
const removeFromDOM = this.dom.replaceWith(this.block.element('foo'), document.createElement('button'));

removeFromDOM();
```

### watchForIntersection

This method tracks the intersection of the given element with the viewport using the `core/dom/intersection-watcher`
module and invokes the specified handler each time the element enters the viewport.
The function returns a destructor to cancel the watching.

```js
const unsubscribe = this.dom.watchForIntersection(
  myElem,
  {delay: 200, group: 'inView'},
  () => console.log('intersection detected!')
);

unsubscribe();
```

### watchForResize

This method watches for the size of the given element using the `core/dom/resize-observer` module and invokes
the specified handler when it changes.
The function returns a destructor to cancel the watching.

Note that changes occurring in the same tick are merged into one.
You can disable this behavior by passing the `immediate: true` option.

```js
const unsubscribe = this.dom.watchForResize(
  myElem,
  {immediate: true, group: 'resize'},
  (newRect, oldRect) => console.log(newRect, oldRect)
);

unsubscribe();
```
