# core/component/directives/tag

This module provides a directive
for dynamically specifying the name of the element tag to which the directive is applied.

```
< div v-tag = 'span'
```

## Why is This Directive Needed?

Unlike the component `:is directive`, which can be used for both creating components and regular elements,
this directive can only be applied to regular elements, and the passed name is always treated as a regular name,
not a component name.
