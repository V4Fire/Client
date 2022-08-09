/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventBinder } from 'core/component/directives/aria/roles-engines/interface';

export interface TreeParams {
	isRoot: boolean;
	orientation: string;
	'@change': EventBinder;
}
