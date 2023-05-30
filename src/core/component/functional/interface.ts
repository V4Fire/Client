/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Slots } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

export interface VirtualContextOptions {
	parent: ComponentInterface;
	props?: Nullable<Dictionary>;
	slots?: Nullable<Slots>;
}
