# components/friends/vdom

This module provides a class for low-level interaction with a component's VDOM tree.

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `vdom` property.
However, to use the module methods, you need to attach them explicitly to enable tree-shake code optimizations.
Simply add the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import VDOM, { create, render } from 'components/friends/vdom';

// Import `create` and `render` methods
VDOM.addToPrototype({create, render});

@component()
export default class bExample extends iBlock {}
```

## Methods

### closest

Returns a link to the closest parent component from the current component.

```js
// Returns a link to the closest `b-wrapper` component or undefined
console.log(this.vdom.closest('b-wrapper'));

// By a constructor
console.log(this.vdom.closest('bWrapper'));
```

### findElement

Searches for a VNode element by the specified element name from another VNode and context.
The function returns the found VNode or undefined.

```js
const vnode = this.vdom.create('div', {
  children: [
    {
      type: 'div',
      attrs: {class: this.block.getFullElementName('elem')}
    }
  ]
});

console.log(this.vdom.findElement('elem', vnode));
```

### create

Creates a VNode or a list of VNodes with specified parameters.

```js
const vnode = this.vdom.create('b-button', {
  attrs: {
    exterior: 'warning',
    'v-show': true,
    '@click': console.log
  },

  children: {default: () => 'Press on me!'}
});

const vnodesFromArgs = this.vdom.create(
  {
    type: 'b-button',

    attrs: {
      exterior: 'warning',
      'v-show': true,
      '@click': console.log
    },

    children: {default: () => 'Press on me!'}
  },

  {
    type: 'div',
    children: ['Hello div']
  }
);

const vnodesFromArr = this.vdom.create([
  {
    type: 'b-button',

    attrs: {
      exterior: 'warning',
      'v-show': true,
      '@click': console.log
    },

    children: {default: () => 'Press on me!'}
  },

  {
    type: 'div',
    children: ['Hello div']
  }
]);
```

### render

Renders the specified VNode or a list of VNodes and returns the result.

```js
const div = this.vdom.render(this.create('div', {attrs: {class: 'foo'}}));

console.log(div.tagName); // DIV
console.log(div.classList.contains('foo')); // true

const divs = this.vdom.render(this.vdom.create(
  {type: 'div', attrs: {class: 'foo'}},
  {type: 'div', attrs: {class: 'bar'}}
));

console.log(div[0].tagName); // DIV
console.log(div[1].classList.contains('bar')); // true
```

### getRenderFactory

Returns a render function factory based on the specified path.
This function is useful when you want to decompose your component template into separate render functions.

```js
// Returns the main render factory of bExample
this.vdom.getRenderFactory('bExample/');
this.vdom.getRenderFactory('bExample.index');

this.vdom.getRenderFactory('bExample.subTemplate');
```

### getRenderFn

Returns a render function using the specified factory or path.
This function is useful when you want to decompose your component template into separate render functions.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template sayHello()
  < .hello
    Hello {{ p.name }}

- template index() extends ['i-static-page.component'].index
  - block body
    /// Invokes the passed render function and joins the result fragment with the main fragment.
    /// Notice, you can pass parameters to another render function.
    < .content v-render = vdom.getRenderFn('pV4ComponentsDemo.sayHello')({p: {name: 'Bob'}})
```

Please note that the result of `getRenderFn` is in the context of the component from which `vdom` is called.
This will have implications for the component hierarchy, i.e.,
the created fragment's `$parent` will be the same as the component that owns vdom.

You can explicitly pass through the context of the component that should serve as the basis for the created fragment.
This is especially important to consider when working with slots.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template renderButton()
  < .wrapper
    < b-button @click:component = console.log($event.$parent.componentName)
      Press on me!

- template index() extends ['i-static-page.component'].index
  - block body
    < b-example
      < template #default = {ctx}
        /// Clicking on the button will display an incorrect value in the console
        < template v-render = vdom.getRenderFn('pV4ComponentsDemo.renderButton')()

        /// Everything is correct here, the parent will be b-example
        < template v-render = vdom.getRenderFn('pV4ComponentsDemo.renderButton', ctx)()
```
