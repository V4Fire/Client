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
 * A dictionary containing the component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentOptions>();

/**
 * A dictionary containing the component declaration parameters that are declared as partial.
 */
export const partialInfo = new Map<string, ComponentConstructorInfo>();

/**
 * A dictionary containing the registered root components
 */
export const rootComponents = Object.createDict<CanPromise<ComponentEngineOptions<typeof ComponentEngine>>>();

/**
 * A dictionary containing the registered components
 */
export const components = new Map<Function | string, ComponentMeta>();

/**
 * A dictionary containing the registered component initializers.
 *
 * By default, components are not registered automatically;
 * they are only registered upon the component's first call from a template or when idle.
 *
 * This dictionary contains functions to register components.
 */
export const componentRegInitializers = Object.createDict<Function[]>();

/**
 * A dictionary containing the registered component render factories
 */
export const componentRenderFactories = Object.createDict<RenderFactory>();

/**
 * A map representing a dictionary where the key is the component name,
 * and the value is a Set of all keys that have a decorator specified
 * within the component declaration
 */
export const componentDecoratedKeys = Object.createDict<Set<string>>();

/**
 * Globally initialized application (not supported in SSR)
 */
export const app: App = {
	context: null,
	component: null,
	state: null
};
