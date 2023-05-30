# core/component/watch

This module provides an API to add a feature of object watching to a component.

## Functions

### createWatchFn

Creates a function to watch property changes from the specified component instance and returns it.

### implementComponentWatchAPI

Implements watch API to the passed component instance.

### bindRemoteWatchers

Binds watchers and event listeners that were registered as remote to the specified component instance.
Basically, this function takes watchers from a meta property of the component,
but you can provide the custom watchers to initialize by using the second parameter of the function.
