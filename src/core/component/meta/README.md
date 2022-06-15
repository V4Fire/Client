# core/component/meta

This module provides API to create an abstract representation of the component.
This structure is used by component library adapters to register "real" components such as Vue or React components.

## Functions

### createMeta

Creates a meta object for the specified component and returns it.

### forkMeta

Creates a new meta object based on the specified.

### inheritMeta

Inherits the specified meta object from other one.
The function modifies the original object and returns it.

### fillMeta

Fills the passed meta object with methods and properties from the specified component class constructor.

### addMethodsToMeta

Iterates over a prototype of the passed component constructor and adds methods/accessors to the specified meta object.

### attachTemplatesToMeta

Attaches templates to the specified meta object.
