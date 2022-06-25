import type { AriaRoleEngine, DirectiveHookParams } from 'core/component/directives/aria/interface';
import type { VNode } from 'core/component';

export default abstract class RoleEngine implements AriaRoleEngine {
	el: Element;
	value: any;
	vnode: VNode;

	constructor({el, opts, vnode}: DirectiveHookParams) {
		this.el = el;
		this.value = opts.value;
		this.vnode = vnode;
	}

	init(): void {
		//
	}

	clear(): void {
		//
	}
}
