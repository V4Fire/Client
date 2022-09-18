/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';

const defaultFn = (): void => undefined;

export interface ComboboxParams {
	multiselectable: boolean;
	'@change': HandlerAttachment;
	'@open': HandlerAttachment;
	'@close': HandlerAttachment;
}

export class ComboboxParams {
	'@change': HandlerAttachment = defaultFn;
	'@open': HandlerAttachment = defaultFn;
	'@close': HandlerAttachment = defaultFn;
}
