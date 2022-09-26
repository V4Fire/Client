/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';

export interface ElCb<CTX extends iBlock = iBlock> {
	(this: CTX, el: Element): void;
}

export interface DOMModificationOptions {
	/**
	 * If true and the source node has a component property,
	 * then when the destructor is called, the destructor of the component will also be called
	 *
	 * @default `false`
	 */
	destroyIfComponent?: boolean;

	/**
	 * A name of the group the watcher belongs to.
	 * The parameter is provided to [[Async]].
	 *
	 * @default `'asyncComponents'`
	 */
	group?: string;
}
