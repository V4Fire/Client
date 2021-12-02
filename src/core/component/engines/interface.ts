/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode as SuperVNode } from 'vue';
import type { ComponentInterface } from '@src/core/component/interface';

export interface VNode extends SuperVNode {
	fakeContext?: ComponentInterface;
}
