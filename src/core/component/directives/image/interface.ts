/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitValue } from 'core/dom/image';
import type { DirectiveBinding } from 'core/component/engines';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<InitValue>> {
	modifiers: Record<string, boolean>;
}
