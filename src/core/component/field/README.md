# core/component/field

This module provides an API to initialize component fields to a component instance.

## What differences between fields and system fields?

The main difference between fields and system fields in V4Fire is that any changes to a regular field
can trigger a re-render of the component template.
In cases where a developer is confident that a field will not require rendering,
system fields should be used instead of regular fields.
It's important to note that changes to any system field can still be watched using the built-in API.

The second difference between regular fields and system fields is their initialization timing.
Regular fields are initialized in the `created` hook, while system fields are initialized in the `beforeCreate` hook.
By understanding the differences between regular fields and system fields,
developers can design and optimize their components for optimal performance and behavior.

## Functions

### initFields

Initializes all fields of a given component instance.
This function returns A dictionary containing the names of the initialized fields as keys,
with their corresponding initialized values as values.
