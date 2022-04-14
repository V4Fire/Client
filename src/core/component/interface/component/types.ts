/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

/**
 * Constructor function of a component
 */
export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * Root DOM element that is tied with a component
 */
export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

/**
 * Base context of a functional component
 */
export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}
