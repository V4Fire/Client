/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	ComponentEngine,
	ComponentOptions as ComponentEngineOptions

} from 'core/component/engines';

import type {

	ComponentMeta,
	ComponentOptions,
	ComponentConstructorInfo,

	RenderFactory,
	App

} from 'core/component/interface';

/**
 * A dictionary with the component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentOptions>();

/**
 * A dictionary with the component declaration parameters
 */
export const partialInfo = new Map<string, ComponentConstructorInfo>();

/**
 * A dictionary with the registered root components
 */
export const rootComponents = Object.createDict<CanPromise<ComponentEngineOptions<typeof ComponentEngine>>>();

/**
 * A dictionary with the registered components
 */
export const components = new Map<Function | string, ComponentMeta>();

/**
 * A dictionary with the registered component initializers.
 * By default, components are not registered automatically, but only upon the component's first call from a template.
 * This dictionary contains functions to register components.
 */
export const componentRegInitializers = Object.createDict<Function[]>();

/**
 * A dictionary with the registered component render factories
 */
export const componentRenderFactories = Object.createDict<RenderFactory>();

/**
 * A dictionary with component pointers for metatables
 */
export const metaPointers = Object.createDict<Dictionary<boolean>>();

/**
 * Global initialized application (not supported in SSR)
 */
export const app: App = {
	context: null,
	component: null,
	state: null
};
