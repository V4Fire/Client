# core/component/watch

This module provides an API to add a feature of object watching to a component.

## Functions

### createWatchFn

Creates a function to watch property changes from the specified component instance and returns it.

### implementComponentWatchAPI

Implements watch API to the passed component instance.

### bindRemoteWatchers

Binds watchers and event listeners,
added through decorators during the class description, to a specific component instance.

Fundamentally, this function retrieves watchers from the component’s `meta` property.
Additionally, you can supply custom watchers as an initialization parameter
through the second argument of the function.

This method contains some "copy-paste" segments,
which are intentionally used to enhance performance, as this is a frequently executed function.
