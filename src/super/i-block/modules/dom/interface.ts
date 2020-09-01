/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export interface ElCb<CTX extends iBlock = iBlock> {
	(this: CTX, el: Element): any;
}

export interface DOMManipulationOptions {
	/**
	 * If true and the source node has a component property,
	 * then when the destructor is called, $destroy of the component will be called too.
	 */
	destroyIfComponent?: boolean;

	/**
	 * Async group
	 *
	 * @see [[Async]]
	 * @default `asyncComponents`
	 */
	group?: string;
}
