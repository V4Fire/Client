/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type VDOM from 'friends/vdom/class';

import type iBlock from 'super/i-block';
import type { VNode } from 'super/i-block';

/**
 * Returns a link to the closest parent component from the current
 * @param component - the component name to search or a link to the component constructor
 */
export function closest<T extends iBlock = iBlock>(
	this: VDOM,
	component: string | ClassConstructor<any[], T> | Function
): CanUndef<T> {
	const
		nm = Object.isString(component) ? component.dasherize() : undefined;

	let
		el = this.ctx.$parent;

	while (el != null) {
		if ((Object.isFunction(component) && el.instance instanceof component) || el.componentName === nm) {
			return Object.cast(el);
		}

		el = el.$parent;
	}

	return undefined;
}

/**
 * Searches a VNode element by the specified name from the passed component virtual tree and context
 *
 * @param vtree
 * @param elName - the element name to search
 * @param [ctx] - the component context to resolve element names
 */
export function findElFromVNode(
	this: VDOM,
	vtree: VNode,
	elName: string,
	ctx: iBlock = this.component
): CanUndef<VNode> {
	const selector = ctx.provide.fullElName(elName);
	return search(vtree);

	function search(vnode: VNode) {
		const
			data = vnode.data ?? {};

		const classes = Object.fromArray(
			Array.concat([], (data.staticClass ?? '').split(' '), data.class)
		);

		if (classes[selector] != null) {
			return vnode;
		}

		if (vnode.children != null) {
			for (let i = 0; i < vnode.children.length; i++) {
				const
					res = search(vnode.children[i]);

				if (res != null) {
					return res;
				}
			}
		}

		return undefined;
	}
}
