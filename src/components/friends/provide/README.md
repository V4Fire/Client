# components/friends/provide

This module provides a class with methods to provide component classes/styles to another component, etc.

```js
// {button: 'b-foo__bla'}
this.provide.classes('b-foo', {button: 'bla'});
```

## Methods

### fullComponentName

Returns the fully qualified component name.

```js
this.componentName === 'b-example';

// 'b-example'
console.log(this.provide.fullComponentName());

// 'b-example_opened_true'
console.log(this.provide.fullComponentName('opened', true));

// 'b-foo'
console.log(this.provide.fullComponentName('b-foo'));

// 'b-foo_opened_true'
console.log(this.provide.fullComponentName('b-foo', 'opened', true));
```

### fullElementName

Returns the fully qualified name of the specified element.

```js
this.componentName === 'b-example';

// 'b-example__foo'
console.log(this.provide.fullElementName('foo'));

// 'b-example__foo_opened_true'
console.log(this.provide.fullElementName('foo', 'opened', true));

// 'b-foo__foo'
console.log(this.provide.fullElementName('b-foo', 'foo'));

// 'b-foo__foo_opened_true'
console.log(this.provide.fullElementName('b-foo', 'foo', 'opened', true));
```

### mods

Returns a dictionary with the base component modifiers.
The base modifiers are taken from the `sharedMods` getter and can be mix in with the specified additional modifiers.

```js
this.provide.sharedMods === {theme: 'foo'};

// {theme: 'foo'}
console.log(this.provide.mods());

// {theme: 'foo', size: 'x'}
console.log(this.provide.mods({size: 'x'}));
```

### classes

Returns a map with classes for the elements of another component.
This function is used to assign element classes of the outer component to the elements of the inner component.
Use it with caution as it's a violation of component encapsulation.

```js
this.componentName === 'b-example';

// {button: `${this.componentName}__button`}
this.provide.classes({button: true});

// {button: `${this.componentName}__submit`}
this.provide.classes({button: 'submit'});

// {button: `${this.componentName}__submit_focused_true`}
this.provide.classes({button: ['submit', 'focused', 'true']});

// {button: 'b-foo__button'}
this.provide.classes('b-foo', {button: true});

// {button: 'b-foo__submit'}
this.provide.classes('b-foo', {button: 'submit'});

// {button: 'b-foo__submit_focused_true'}
this.provide.classes('b-foo', {button: ['submit', 'focused', 'true']});
```

### componentClasses

Returns a list of classes for the current component.

```js
this.componentName === 'b-example';

// ['b-example']
this.provide.componentClasses();

// ['b-example', 'b-example_checked_true']
this.provide.componentClasses({checked: true});

// ['b-foo']
this.provide.componentClasses('b-foo');

// ['b-foo', 'b-foo_checked_true']
this.provide.componentClasses('b-foo', {checked: true});
```

### elementClasses

Returns a list of classes for the specified element of the current component.

```js
this.componentName === 'b-example';

// [this.componentId, 'b-example__button', 'b-example__button_focused_true']
this.provide.elementClasses({button: {focused: true}});

// ['b-foo__button', 'b-foo__button_focused_true']
this.provide.elementClasses('b-foo', {button: {focused: true}});

// [anotherComponent.componentId, anotherComponent.componentName, `${anotherComponent.componentName}__button_focused_true`]
this.provide.elementClasses(anotherComponent, {button: {focused: true}});
```

### hintClasses

Returns a list of hint classes by the specified parameters.

```js
// ['g-hint', 'g-hint_pos_bottom']
this.provide.hintClasses();

// ['g-hint', 'g-hint_pos_top']
this.provide.hintClasses('top');
```
