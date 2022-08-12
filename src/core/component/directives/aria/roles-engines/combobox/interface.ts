/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractParams, HandlerAttachment } from 'core/component/directives/aria/roles-engines/interface';

export interface ComboboxParams extends AbstractParams {
	isMultiple: boolean;
	'@change': HandlerAttachment;
	'@open': HandlerAttachment;
	'@close': HandlerAttachment;
}
