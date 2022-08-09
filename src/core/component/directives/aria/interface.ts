/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions {
	el: HTMLElement;
	binding: VNodeDirective;
	vnode: VNode;
}
