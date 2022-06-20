/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentEngine, ComponentOptions as ComponentEngineOptions } from 'core/component/engines';
import type { ComponentInterface, ComponentMeta, ComponentOptions, RenderFactory } from 'core/component/interface';

/**
 * A dictionary with component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentOptions>();

/**
 * A dictionary with the registered root components
 */
export const rootComponents = Object.createDict<Promise<ComponentEngineOptions<typeof ComponentEngine>>>();

/**
 * A link to the root component instance
 */
export const globalRootComponent = <{link: Nullable<ComponentInterface>}>{
	link: null
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
