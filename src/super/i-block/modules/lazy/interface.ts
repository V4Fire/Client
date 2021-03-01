/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';
import type iBlock from 'super/i-block/i-block';

export interface CreateLazyFnOptions extends AsyncOptions {
	delay?: number;
}

export interface LazyFn<FN extends (...args: unknown[]) => unknown, CTX extends iBlock = iBlock> {
	(this: CTX, ...args: Parameters<FN>): Promise<ReturnType<FN>>;
	(...args: Parameters<FN>): Promise<ReturnType<FN>>;
}
