/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';

export interface OptionParams {
	selected: boolean;
	'@change': HandlerAttachment;
}

export class OptionParams {
	'@change': HandlerAttachment = () => undefined;
}
