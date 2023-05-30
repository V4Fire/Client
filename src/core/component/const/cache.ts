/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	ComponentEngine,
	ComponentOptions as ComponentEngineOptions,
	CreateAppFunction

} from 'core/component/engines';

import type {

	ComponentMeta,
	ComponentInterface,
	ComponentOptions,
	RenderFactory

} from 'core/component/interface';

/**
 * A dictionary with component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentOptions>();

/**
 * A dictionary with the registered root components
 */
export const rootComponents = Object.createDict<CanPromise<ComponentEngineOptions<typeof ComponentEngine>>>();

interface App {
	context: Nullable<ReturnType<CreateAppFunction>>;
	component: Nullable<ComponentInterface>;
}

/**
 * A link to the application context and the root component
 */
export const app: App = {
	context: null,
	component: null
};

/**
 * A dictionary with the registered components
 */
export const components = new Map<Function | string, ComponentMeta>();

/**
 * A dictionary with the registered component initializers.
 * By default, all components don't register automatically, but the first call from some template.
 * This structure contains functions to register components.
 */
export const componentRegInitializers = Object.createDict<Function[]>();

/**
 * A dictionary with the registered component render factories
 */
export const componentRenderFactories = Object.createDict<RenderFactory>();

/**
 * A dictionary with component pointers for meta tables
 */
export const metaPointers = Object.createDict<Dictionary<boolean>>();
