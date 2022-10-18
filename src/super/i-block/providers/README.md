# super/i-block/providers

This module provides an API for initializing and loading external data to a component.

## How does a component load its data?

When a component is created, it calls its `initLoad` method. This method, depending on the component parameters,
can either immediately switch it to `ready` (nothing needs to be loaded), or initialize the loading of resources:
switch the component to the `loading` status, and after all the resources are loaded, switch it to ` ready` and
initialize re-rendering (if necessary).

## API

### Props

#### dependenciesProp

A list of additional dependencies to load when the component is initializing.

### Fields

#### dependencies

A list of additional dependencies to load when the component is initializing.

### Methods
