/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from '@src/super/i-block/i-block';

export interface ElCb<CTX extends iBlock = iBlock> {
	(this: CTX, el: Element): AnyToIgnore;
}

export const
	inViewInstanceStoreSymbol: unique symbol = Symbol.for('in-view instance store');

/**
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	inViewInstanceStore = inViewInstanceStoreSymbol;

export interface DOMManipulationOptions {
	/**
	 * If true and the source node has a component property,
	 * then when the destructor is called, the component' destructor will be called too
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
