/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchObject } from 'core/component/interface/watch';
import { ComponentConstructor, PropOptions, RenderFunction, ModsDecl } from 'core/component/interface';

import {

	ComponentOptions,
	ComponentProp,
	ComponentField,
	ComponentComputedField,
	ComponentAccessor,
	ComponentMethod,
	ComponentHooks,
	ComponentDirectiveOptions

} from 'core/component/meta/interface/types';

export * from 'core/component/meta/interface/types';

/**
 * Abstract representation of a component
 */
export interface ComponentMeta {
	/**
	 * Full name of a component.
	 * If the component is smart the name can be equal to `b-foo-functional`.
	 */
	name: string;

	/**
	 * Name of the component without special postfixes
	 */
	componentName: string;

	/**
	 * Link to the component constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * Link to a component instance
	 */
	instance: Dictionary;

	/**
	 * Map of component parameters that was provided to a @component decorator
	 */
	params: ComponentOptions;

	/**
	 * Link to a parent component meta object
	 */
	parentMeta?: ComponentMeta;

	/**
	 * Map of component input properties
	 */
	props: Dictionary<ComponentProp>;

	/**
	 * Map of component fields that can force re-rendering
	 */
	fields: Dictionary<ComponentField>;

	/**
	 * Map of component fields that can't force re-rendering
	 */
	systemFields: Dictionary<ComponentField>;

	/**
	 * Map of available component modifiers
	 */
	mods: ModsDecl;

	/**
	 * Map of component accessors with support of caching
	 */
	computed: Dictionary<ComponentAccessor>;

	/**
	 * Map of component accessors without support of caching
	 */
	accessors: Dictionary<ComponentAccessor>;

	/**
	 * Map of component methods
	 */
	methods: Dictionary<ComponentMethod>;

	/**
	 * Map of component watchers
	 */
	watchers: Dictionary<WatchObject[]>;

	/**
	 * Map of component hook listeners
	 */
	hooks: ComponentHooks;

	/**
	 * Less abstract representation of the component.
	 * This representation is more useful to provide to a component library.
	 */
	component: {
		/**
		 * Full name of a component.
		 * If the component is smart the name can be equal to `b-foo-functional`.
		 */
		name: string;

		/**
		 * Map of default component modifiers
		 */
		mods: Dictionary<string>;

		/**
		 * Map of component input properties
		 */
		props: Dictionary<PropOptions>;

		/**
		 * Map of component methods
		 */
		methods: Dictionary<Function>;

		/**
		 * Map of component accessors with support of caching
		 */
		computed: Dictionary<ComponentComputedField>;

		/**
		 * Map of available component filters
		 */
		filters?: Dictionary<Function>;

		/**
		 * Map of available component directives
		 */
		directives?: Dictionary<ComponentDirectiveOptions>;

		/**
		 * Map of available local components
		 */
		components?: Dictionary<ComponentMeta['component']>;

		/**
		 * List of static render functions
		 */
		staticRenderFns: RenderFunction[];

		/**
		 * Main render function of the component
		 */
		render: RenderFunction;
	}
}
