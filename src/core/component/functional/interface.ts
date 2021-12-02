/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from '~/core/component/engines';
import type { ComponentInterface } from '~/core/component/interface';

export interface CreateFakeCtxOptions {
	/**
	 * If true, then component prop values will be forced to initialize
	 */
	initProps?: boolean;
}

export interface FlyweightVNode extends VNode {
	fakeInstance: ComponentInterface;
}
