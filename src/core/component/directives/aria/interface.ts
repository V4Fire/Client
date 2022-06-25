/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNodeDirective, VNode } from 'core/component/engines';

export interface DirectiveHookParams {
	el: Element;
	opts: VNodeDirective;
	vnode: VNode;
}

export interface AriaRoleEngine {
	el: Element;
	value: any;
	vnode: VNode;

	init(): void;
	clear(): void;
}
