/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { normalizeClass } from 'core/component';
import type { VNode } from 'core/component/engines';

import type Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

/**
 * Returns a link to the closest parent component from the current
 *
 * @param component - the component name to search or a link to the component constructor
 *
 * @example
 * ```js
 * // Returns a link to the closes `b-wrapper` component or undefined
 * console.log(this.vdom.closest('b-wrapper'));
 *
 * // By a constructor
 * console.log(this.vdom.closest('bWrapper'));
 * ```
 */
export function closest<T extends iBlock = iBlock>(
	this: Friend,
	component: string | ClassConstructor<any[], T> | Function
): CanNull<T> {
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

	return null;
}

/**
 * Searches a VNode element by the specified element name from another VNode and context.
 * The function returns the found VNode or undefined.
 *
 * @param name - the element name to search
 * @param where - the vnode where to search
 * @param [ctx] - a component context to resolve the passed element name
 *
 * @example
 * ```js
 * const vnode = this.vdom.create('div', {
 *   children: [
 *     {
 *       type: 'div',
 *       attrs: {class: this.block.getFullElementName('elem')}
 *     }
 *   ]
 * });
 *
 * console.log(this.vdom.findElement('elem', vnode));
 * ```
 */
export function findElement(
	this: Friend,
	name: string,
	where: VNode,
	ctx: iBlock = this.component
): CanNull<VNode> {
	const selector = ctx.provide.fullElementName(name);
	return search(where);

	function search(vnode: VNode) {
		const props = vnode.props ?? {};

		if (props.class != null) {
			const classes = normalizeClass(props.class).split(' ');

			if (classes.includes(selector)) {
				return vnode;
			}
		}

		const {children} = vnode;

		if (Object.isArray(children)) {
			for (const el of children) {
				if (Object.isPrimitive(el) || Object.isArray(el)) {
					continue;
				}

				const res = search(Object.cast(el));

				if (res != null) {
					return res;
				}
			}
		}

		return null;
	}
}
