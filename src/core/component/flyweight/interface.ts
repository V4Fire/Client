/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNode } from 'core/component/engines';
import { ComponentInterface } from 'core/component/interface';

export interface FlyweightVNode extends VNode {
	fakeInstance: ComponentInterface;
}
