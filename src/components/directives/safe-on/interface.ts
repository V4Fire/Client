/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding } from 'core/component/engines';

export interface SafeOnDirectiveParams extends DirectiveBinding {
	value(...args: unknown[]): unknown;
}
