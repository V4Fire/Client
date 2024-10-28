# core/component/context

This module provides a bunch of helpers to work with a component context.

## What Problem is Being Solved?

The V4Fire library creates a domain-specific language (DSL) wrapper over the component libraries it uses.
This allows developers to use TypeScript classes to describe their components, regardless of the underlying library.
To be used as an engine for V4Fire, a component library must implement a set of necessary properties and
methods described in the [[ComponentInterface]] interface.
However, because V4Fire needs to redefine some properties and methods from the engine for correct platform operation
and some of these properties may be marked as read-only, simple property overrides are not possible.
This module provides an API to create a new context object whose properties can be overridden,
allowing developers to customize and extend the components they use in V4Fire, and providing greater flexibility and
modularity in application development.

## Functions

### getComponentContext

Returns a wrapped component context object based on the passed one.
This function allows developers to override component properties and methods without altering the original object.
Essentially, override creates a new object that contains the original object as its prototype,
allowing for the addition, modification, or removal of properties and methods without affecting the original object.

### saveRawComponentContext

Stores a reference to the "raw" component context in the main context.

### dropRawComponentContext

Drops a reference to the "raw" component context from the main context.
