/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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

	ComponentDirectiveOptions,
	ComponentWatchDependencies,
	ComponentWatchPropDependencies

} from 'core/component/meta/interface/types';

export * from 'core/component/meta/interface/options';
export * from 'core/component/meta/interface/types';

/**
 * An abstract component representation
 */
export interface ComponentMeta {
	/**
	 * Full name of the component.
	 * If the component is smart, the name can contain a `-functional` postfix.
	 */
	name: string;

	/**
	 * Component name without special postfixes
	 */
	componentName: string;

	/**
	 * A link to the component constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * A link to a component class instance
	 */
	instance: Dictionary;

	/**
	 * A dictionary with the component parameters that were provided to the `@component` decorator
	 */
	params: ComponentOptions;

	/**
	 * A link to the parent component meta object
	 */
	parentMeta?: ComponentMeta;

	/**
	 * A dictionary with the component input properties, aka "props"
	 */
	props: Dictionary<ComponentProp>;

	/**
	 * A dictionary with the available component modifiers
	 */
	mods: ModsDecl;

	/**
	 * A dictionary with the component fields that can force re-rendering
	 */
	fields: Dictionary<ComponentField>;

	/**
	 * A dictionary with the component fields that can't force re-rendering
	 */
	systemFields: Dictionary<ComponentField>;

	/**
	 * A dictionary with the component fields that contains the `Store` postfix
	 */
	tiedFields: Dictionary<string>;

	/**
	 * A dictionary with the component accessors with the support of caching/watching
	 */
	computedFields: Dictionary<ComponentAccessor>;

	/**
	 * A dictionary with the simple component accessors
	 */
	accessors: Dictionary<ComponentAccessor>;

	/**
	 * A dictionary with the component methods
	 */
	methods: Dictionary<ComponentMethod>;

	/**
	 * A dictionary with the component watchers
	 */
	watchers: Dictionary<WatchObject[]>;

	/**
	 * A dictionary with the component dependencies to watch
	 * (to invalidate the cache of computed fields)
	 */
	watchDependencies: ComponentWatchDependencies;

	/**
	 * A dictionary with the component prop dependencies to watch
	 * (to invalidate the cache of computed fields)
	 */
	watchPropDependencies: ComponentWatchPropDependencies;

	/**
	 * A dictionary with the component hook listeners
	 */
	hooks: ComponentHooks;

	/**
	 * A less abstract representation of the component.
	 * This structure is more useful for a component library.
	 */
	component: {
		/**
		 * Full name of the component.
		 * If the component is smart, the name can contain a `-functional` postfix.
		 */
		name: string;

		/**
		 * A dictionary with the default component modifiers
		 */
		mods: Dictionary<string>;

		/**
		 * A dictionary with the component input properties, aka "props"
		 */
		props: Dictionary<PropOptions>;

		/**
		 * A dictionary with the component computed fields
		 */
		computed: Dictionary<Partial<WritableComputedOptions<unknown>>>;

		/**
		 * A dictionary with the component methods
		 */
		methods: Dictionary<Function>;

		/**
		 * A dictionary with the available component directives
		 */
		directives?: Dictionary<ComponentDirectiveOptions>;

		/**
		 * A dictionary with the available local components
		 */
		components?: Dictionary<ComponentMeta['component']>;

		/**
		 * The component render function
		 */
		render: RenderFunction;
	};
}
