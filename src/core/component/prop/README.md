# core/component/prop

This module offers an API to initialize component props within a component instance.

## Functions

### initProps

Initializes the input properties (also known as "props") for the given component instance.
During the initialization of a component prop, its name will be stored in the `$activeField` property.
The function returns a dictionary containing the initialized props.
