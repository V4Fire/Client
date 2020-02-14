/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentOptions, ComponentDriver } from 'core/component/engines';
import { ComponentMeta, ComponentParams } from 'core/component/interface';

/**
 * Map of component declaration parameters
 */
export const componentParams = new Map<Function | string, ComponentParams>();

/**
 * Map of root components
 */
export const rootComponents = Object.createDict<Promise<ComponentOptions<ComponentDriver>>>();

/**
 * Map of registered components
 */
export const components = new Map<Function | string, ComponentMeta>();

/**
 * Map of component initializers:
 * by default all components don't register automatically but a first call from a template,
 * and this map contains functions to register components.
 */
export const componentInitializers = Object.createDict<Function[]>();

/**
 * Map of component render functions
 */
export const componentTemplates = Object.createDict();

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
