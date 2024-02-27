/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config as SuperConfig } from 'dompurify';
import type { DirectiveBinding } from 'core/component/engines';

interface Config extends Omit<SuperConfig, 'RETURN_DOM' | 'RETURN_DOM_FRAGMENT'> {}

export interface SafeHtmlDirectiveParams extends DirectiveBinding {
	value: string | {
		value: string;
		options?: Config;
	};
}
