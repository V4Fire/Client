# core/component/directives/id

This module provides a directive to easily add an id attribute to an element.

```
< div v-id = 'title'
```

## Why is this directive needed?

A page cannot have two or more elements with the same id attribute at the same time. But when we design or edit a
component markup and add such an attribute, we cannot be sure that the name is not already used by other components.
To solve this problem, any component has the `dom.getId` method.

```
< div :id = dom.getId('title')
```

This method returns the passed identifier, plus the unique ID of the component within which the method is called.
Thus, we only need to guarantee the uniqueness of the identifier within one template, and not all components.
The problem is solved, but now our template has become more "dirty" due to the addition of syntactic noise with the
method call and other stuff. This directive just solves this problem.

```
< div v-id = 'title'
```

The same as

```
< div :id = dom.getId('title')
```

## Modifiers

### preserve

This modifier means that if the element already has an id attribute, then the directive will leave it and won't overwrite it

```
< div id = my-div1 | v-id = 'title1'
< div id = my-div2 | v-id.preserve = 'title2'
```

Will turn into

```html
<div id="title1"></div>
<div id="my-div2"></div>
```
