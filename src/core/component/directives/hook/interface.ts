/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective, DirectiveFunction } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	value?: {
		bind?: DirectiveFunction;
		inserted?: DirectiveFunction;
		update?: DirectiveFunction;
		componentUpdated?: DirectiveFunction;
		unbind?: DirectiveFunction;
	};
}
