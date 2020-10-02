/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';
import { InitValue } from 'core/dom/image';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: InitValue;
}
