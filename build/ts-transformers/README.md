# build/ts-transformers

This module provides a bunch of custom transformers for TypeScript/TSC.

## Default Transformers

* `set-component-layer` - this module provides a transformer that adds information to each component declaration about
  the application layer in which the component is declared.

* `resister-component-default-values` - this module provides a transformer for extracting default properties
  of a component class into a special decorator `@defaultValue` (`core/component/decorators/default-value`).
