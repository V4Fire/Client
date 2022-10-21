/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding } from 'core/component/engines';

export interface DirectiveParams extends DirectiveBinding<CanUndef<string>> {}

export interface Icon {
	id: string;
	content: string;
	viewBox: string;
	stringify(): string;
	destroy(): void;
}
