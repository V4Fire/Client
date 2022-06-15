# core/component/field

This module provides an API to initialize component fields to a component instance.

## What differences between fields and system fields?

The major difference between fields and system fields, that any changes of a component field can force re-rendering of its template.
I.e., if you are totally sure that your component field doesn't need to force rendering, prefer system fields instead of regular.
Mind, changes in any system field still can be watched using built-in API.

The second difference is that system fields are initialized on the `beforeCreate` hook,
but not on the `created` hook like the regular fields do.

## Functions

### initFields

Initializes all fields of the passed component instance.
The function returns a dictionary with the initialized fields.
