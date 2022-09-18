/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Orientation } from 'base/b-list/interface';
import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';

export interface TabParams {
	first: boolean;
	selected: boolean;
	hasDefaultSelectedTabs: boolean;
	orientation: Orientation;
	'@change': HandlerAttachment;
}

export class TabParams {
	first: boolean = false;
	hasDefaultSelectedTabs: boolean = false;
	'@change': HandlerAttachment = () => undefined;
}
