/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RenderObject } from '~/core/component/render';
import type { ComponentEngine, ComponentOptions as ComponentEngineOptions } from '~/core/component/engines';
import type { ComponentInterface, ComponentMeta, ComponentOptions } from '~/core/component/interface';

/**
 * Map of component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentOptions>();

/**
 * Map of root components
 */
export const rootComponents = Object.createDict<Promise<ComponentEngineOptions<ComponentEngine>>>();

/**
 * Link to an instance of the global root component
 */
export const globalRootComponent = <{link: Nullable<ComponentInterface>}>{
	link: null
};

/**
 * Map of registered components
 */
export const components = new Map<Function | string, ComponentMeta>();

/**
 * Map of component initializers:
 * by default all components don't register automatically, but the first call from a template,
 * and this map contains functions to register components.
 */
export const componentInitializers = Object.createDict<Function[]>();

/**
 * Map of component render functions
 */
export const componentTemplates = Object.createDict<RenderObject>();

/**
 * Cache of minimal required context objects for component render functions
 *
 * @example
 * ```js
 * function bButtonRender() {
 *   return this.createComponent('div');
 * }
 *
 * bButtonRender.call(renderCtxCache['b-button']);
 * ```
 */
export const renderCtxCache = Object.createDict();

/**
 * Map of component pointers for meta tables
 */
export const metaPointers = Object.createDict<Dictionary<boolean>>();
