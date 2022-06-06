/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

/**
 * A component constructor function
 */
export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * A component root DOM element
 */
export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

/**
 * The base context of a functional component
 */
export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}
