/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';
import type { Orientation } from 'core/component/directives/aria';

export interface TabParams {
	selected: boolean;
	orientation: Orientation;
}

export class TabParams {
	first: boolean = false;
	hasDefaultSelectedTabs: boolean = false;
	'@change': HandlerAttachment = () => undefined;
}
