# core/component/meta

This module offers an API for creating an abstract representation of a component.
This structure can be used by adapters in component libraries to register "real" components,
such as Vue or React components.

The component representation is a plain JavaScript dictionary that includes all the input parameters,
fields, methods, accessors, etc. of the component.

```typescript
export interface ComponentMeta {
  /**
   * The full name of the component, which may include a `-functional` postfix if the component is smart
   */
  name: string;

  /**
   * Component name without any special postfixes
   */
  componentName: string;

  /**
   * A link to the component's constructor
   */
  constructor: ComponentConstructor;

  /**
   * A link to the component's class instance
   */
  instance: Dictionary;

  /**
   * A dictionary containing the parameters provided to the `@component` decorator for the component
   */
  params: ComponentOptions;

  /**
   * A link to the metaobject of the parent component
   */
  parentMeta?: ComponentMeta;

  /**
   * A dictionary containing the input properties (props) for the component
   */
  props: Dictionary<ComponentProp>;

  /**
   * A dictionary containing the available component modifiers.
   * Modifiers are a way to alter the behavior or appearance of a component without changing its underlying
   * functionality.
   * They can be used to customize components for specific use cases, or to extend their capabilities.
   * The modifiers may include options such as size, color, placement, and other configurations.
   */
  mods: ModsDecl;

  /**
   * A dictionary containing the component fields that can trigger a re-rendering of the component
   */
  fields: Dictionary<ComponentField>;

  /**
   * A dictionary containing the component fields that do not cause a re-rendering of the component when they change.
   * These fields are typically used for internal bookkeeping or for caching computed values,
   * and do not affect the visual representation of the component.
   * Examples include variables used for storing data or for tracking the component's internal state,
   * and helper functions or methods that do not modify any reactive properties.
   * It's important to identify and distinguish these non-reactive fields from the reactive ones,
   * and to use them appropriately to optimize the performance of the component.
   */
  systemFields: Dictionary<ComponentField>;

  /**
   * A dictionary containing the component fields that have a "Store" postfix in their name
   */
  tiedFields: Dictionary<string>;

  /**
   * A dictionary containing the accessor methods of the component that support caching or watching
   */
  computedFields: Dictionary<ComponentAccessor>;

  /**
   * A dictionary containing the simple component accessors,
   * which are typically used for retrieving or modifying the value of a non-reactive property
   * that does not require caching or watching
   */
  accessors: Dictionary<ComponentAccessor>;

  /**
   * A dictionary containing the component methods
   */
  methods: Dictionary<ComponentMethod>;

  /**
   * A dictionary with the component watchers
   */
  watchers: Dictionary<WatchObject[]>;

  /**
   * A dictionary containing the component dependencies to watch to invalidate the cache of computed fields
   */
  watchDependencies: ComponentWatchDependencies;

  /**
   * A dictionary containing the component prop dependencies to watch
   * to invalidate the cache of computed fields
   */
  watchPropDependencies: ComponentWatchPropDependencies;

  /**
   * A dictionary containing the component hook listeners,
   * which are essentially functions that are executed at specific stages in the V4Fire component's lifecycle
   */
  hooks: ComponentHooks;

  /**
   * A less abstract representation of the component would typically include the following elements,
   * which are useful for building component libraries:
   */
  component: {
    /**
     * The full name of the component, which may include a `-functional` postfix if the component is smart
     */
    name: string;

    /**
     * A dictionary containing the input properties (props) for the component
     */
    props: Dictionary<PropOptions>;

    /**
     * A dictionary with registered component attributes.
     * Unlike props, changing attributes does not lead to re-rendering of the component template.
     */
    attrs: Dictionary<PropOptions>;

    /**
     * A dictionary containing the default component modifiers
     */
    mods: Dictionary<string>;

    /**
     * A dictionary containing the accessor methods of the component that support caching or watching
     */
    computed: Dictionary<Partial<WritableComputedOptions<unknown>>>;

    /**
     * A dictionary containing the component methods
     */
    methods: Dictionary<Function>;

    /**
     * A dictionary containing the available component directives
     */
    directives?: Dictionary<ComponentDirectiveOptions>;

    /**
     * A dictionary containing the available local components
     */
    components?: Dictionary<ComponentMeta['component']>;

    /**
     * The component's render function
     */
    render?: RenderFunction;

    /**
     * The component's render function for use with SSR
     */
    ssrRender?: RenderFunction;
  };
}
```

## Functions

### createMeta

This function creates a component metaobject based on the information from its constructor,
and then returns this object.

### forkMeta

Forks the metaobject of the passed component and returns the copy.

### inheritMeta

Inherits the specified metaobject from another one.
This function modifies the original object and returns it.

### inheritParams

Inherits the `params` property for a given metaobject based on the parent one.
This function modifies the original object.

### inheritMods

Inherits the `mods` property for a given metaobject based on the parent one.
This function modifies the original object.

### fillMeta

Populates the passed metaobject with methods and properties from the specified component class constructor.

### addMethodsToMeta

Loops through the prototype of the passed component constructor and
adds methods and accessors to the specified metaobject.

### attachTemplatesToMeta

Attaches templates to the specified metaobject.
