/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles-engines/interface';

export class TabParams {
	isFirst: boolean = false;
	isSelected: boolean = false;
	hasDefaultSelectedTabs: boolean = false;
	orientation: string = 'false';
	'@change': HandlerAttachment = () => undefined;
}
