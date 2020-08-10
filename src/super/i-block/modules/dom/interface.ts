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

export const
	inViewInstanceStoreSymbol: unique symbol = Symbol.for('in-view instance store');

/**
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export const
	inViewInstanceStore = <any>inViewInstanceStoreSymbol;
