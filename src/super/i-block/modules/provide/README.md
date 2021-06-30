# super/i-block/modules/provide

This module provides a class with methods to provide component classes/styles to another component, etc.

```js
// {button: 'b-foo__bla'}
this.provide.classes('b-foo', {button: 'bla'});
```

## fullComponentName

Returns a full name of the specified component.

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

## fullElName

Returns a full name of the specified element.

```js
this.componentName === 'b-example';

// 'b-example__foo'
console.log(this.provide.fullElName('foo'));

// 'b-example__foo_opened_true'
console.log(this.provide.fullElName('foo', 'opened', true));

// 'b-foo__foo'
console.log(this.provide.fullElName('b-foo', 'foo'));

// 'b-foo__foo_opened_true'
console.log(this.provide.fullElName('b-foo', 'foo', 'opened', true));
```

## mods

Returns a dictionary with the base component modifiers.
The base modifiers are taken from the `baseMods` getter and can be mix in with the specified additional modifiers.

```js
this.provide.baseMods === {theme: 'foo'};

// {theme: 'foo'}
console.log(this.provide.mods());

// {theme: 'foo', size: 'x'}
console.log(this.provide.mods({size: 'x'}));
```

## classes

Returns a map with classes for elements of another component.
This method is used to provide some extra classes to elements of an external component.

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

## componentClasses

Returns an array of component classes by the specified parameters.

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

## elClasses

Returns an array of element classes by the specified parameters.

```js
this.componentName === 'b-example';

// [this.componentId, 'b-example__button', 'b-example__button_focused_true']
this.provide.elClasses({button: {focused: true}});

// ['b-foo__button', 'b-foo__button_focused_true']
this.provide.elClasses('b-foo', {button: {focused: true}});

// [anotherComponent.componentId, anotherComponent.componentName, `${anotherComponent.componentName}__button_focused_true`]
this.provide.elClasses(anotherComponent, {button: {focused: true}});
```

## hintClasses

Returns an array of hint classes by the specified parameters.

```js
// ['g-hint', 'g-hint_pos_bottom']
this.provide.hintClasses();

// ['g-hint', 'g-hint_pos_top']
this.provide.hintClasses('top');
```
