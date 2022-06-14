# core/component/context

This module provides a bunch of helpers to work with a component context.

## What problem is being solved?

The V4Fire library creates a DSL wrapper over the used component library.
Thanks to this, we can use TS classes to describe our components, regardless of the library used under the hood.
In order for a component library to be used as an engine for V4Fire, it must implement a set of necessary properties and
methods that are described in the [[ComponentInterface]] interface. Also, for the correct working of the entire platform,
V4Fire must redefine some properties and methods from the engine. But since these properties can be marked as read-only,
i.e. we can’t do simple property override. To solve these problems, this module was created.
It provides API to create a new context object whose properties can be overridden.

## Methods

### getComponentContext

Returns a wrapped component context object based on the passed one.
This function is used to allow overwriting component properties and methods without hacking the original object.
Basically, this function returns a new object that contains the original object as a prototype.
