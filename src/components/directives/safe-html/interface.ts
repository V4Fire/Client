/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { SanitizedOptions as XSSOptions } from 'core/html/xss';
import type { DirectiveBinding } from 'core/component/engines';

export interface SanitizedOptions extends Omit<XSSOptions, 'RETURN_DOM' | 'RETURN_DOM_FRAGMENT'> {}

export interface SafeHtmlDirectiveParams extends DirectiveBinding {
	value: Primitive | {
		value: Primitive;
		options?: SanitizedOptions;
	};
}
