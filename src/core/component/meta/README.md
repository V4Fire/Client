# core/component/meta

This module provides an API to create an abstract representation of the component.
This structure is used by component library adapters to register "real" components such as Vue or React components.

## Functions

### createMeta

Creates a metaobject for the specified component and returns it.

### forkMeta

Creates a new metaobject based on the specified.

### inheritMeta

Inherits the specified metaobject from other one.
The function modifies the original object and returns it.

### fillMeta

Fills the passed metaobject with methods and properties from the specified component class constructor.

### addMethodsToMeta

Iterates over a prototype of the passed component constructor and adds methods/accessors to the specified metaobject.

### attachTemplatesToMeta

Attaches templates to the specified metaobject.
