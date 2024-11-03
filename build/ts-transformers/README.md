# build/ts-transformers

This module provides a bunch of custom transformers for TypeScript/TSC.

## Default Transformers

* `set-component-layer` - this module provides a transformer that adds information to each component declaration about
  the application layer in which the component is declared.

* `register-component-parts` - this module provides a transformer for registering parts of a class as parts of the associated component.
