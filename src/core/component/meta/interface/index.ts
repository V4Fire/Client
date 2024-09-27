/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath } from 'core/object/watch';

import type { PropOptions } from 'core/component/decorators';
import type { RenderFunction, WritableComputedOptions } from 'core/component/engines';

import type { WatchObject, ComponentConstructor, ModsDecl } from 'core/component/interface';
import type { ComponentOptions } from 'core/component/meta/interface/options';

import type {

	ComponentProp,
	ComponentField,

	ComponentMethod,
	ComponentAccessor,
	ComponentHooks,

	ComponentDirectiveOptions

} from 'core/component/meta/interface/types';

export * from 'core/component/meta/interface/options';
export * from 'core/component/meta/interface/types';

/**
 * An abstract component representation
 */
export interface ComponentMeta {
	/**
	 * The full name of the component, which may include a `-functional` postfix if the component is smart
	 */
	name: string;

	/**
	 * The name of the NPM package in which the component is defined or overridden
	 */
	layer?: string;

	/**
	 * Component name without any special suffixes
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
	parentMeta: CanNull<ComponentMeta>;

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
	 * A dictionary containing the component properties as well as properties that are related to them.
	 * For example:
	 *
	 * `foo → fooStore`
	 * `fooStore → foo`
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
	 * A map containing the component methods
	 */
	methods: Map<string, ComponentMethod>;

	/**
	 * A map containing the component's watchers
	 */
	watchers: Map<string, WatchObject[]>;

	/**
	 * A map containing the component dependencies to watch to invalidate the cache of computed fields.
	 */
	watchDependencies: Map<WatchPath, WatchPath[]>;

	/**
	 * A map containing the component prop dependencies to watch to invalidate the cache of computed fields
	 */
	watchPropDependencies: Map<WatchPath, Set<string>>;

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
		 * A dictionary with registered component props
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
