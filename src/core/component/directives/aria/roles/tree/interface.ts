/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';
import type { Orientation } from 'core/component/directives/aria';

export class TreeParams {
	root: boolean = false;
	orientation: Orientation = 'vertical';
	'@change': HandlerAttachment = () => undefined;
}
