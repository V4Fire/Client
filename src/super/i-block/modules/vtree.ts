/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { ComponentElement } from 'core/component';

export default class VTree {
	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns a link to the closest parent component for the current
	 * @param component - component name or a link to the component constructor
	 */
	closest<T extends iBlock = iBlock>(component: string | ClassConstructor<T>): CanUndef<T> {
		const
			nm = Object.isString(component) ? component.dasherize() : undefined;

		let
			el = <CanUndef<T>>this.component.$parent;

		while (el) {
			if (Object.isFunction(component) && el.instance instanceof component || el.componentName === nm) {
				return el;
			}

			el = <CanUndef<T>>el.$parent;
		}

		return undefined;
	}

	/**
	 * Searches an element by the specified name from a virtual node
	 *
	 * @param vnode
	 * @param elName
	 * @param [ctx] - component context
	 */
	protected findElFromVNode(vnode: VNode, elName: string, ctx: iBlock = this): CanUndef<VNode> {
		const
			selector = ctx.getFullElName(elName);

		const search = (vnode) => {
			const
				data = vnode.data || {};

			const classes = Object.fromArray([].concat(
				(data.staticClass || '').split(' '),
				data.class || []
			));

			if (classes[selector]) {
				return vnode;
			}

			if (vnode.children) {
				for (let i = 0; i < vnode.children.length; i++) {
					const
						res = search(vnode.children[i]);

					if (res) {
						return res;
					}
				}
			}

			return undefined;
		};

		return search(vnode);
	}

	/**
	 * Returns an instance of a component by the specified element
	 *
	 * @param el
	 * @param [filter]
	 */
	$<T extends iBlock>(el: ComponentElement<T>, filter?: string): T;

	/**
	 * Returns an instance of a component by the specified query
	 *
	 * @param query
	 * @param [filter]
	 */
	$<T extends iBlock>(query: string, filter?: string): CanUndef<T>;
	$<T extends iBlock>(query: string | ComponentElement<T>, filter: string = ''): CanUndef<T> {
		const
			q = Object.isString(query) ? document.body.querySelector<ComponentElement<T>>(query) : query;

		if (q) {
			if (q.component && (q.component.instance instanceof iBlock)) {
				return q.component;
			}

			const
				el = <ComponentElement<T>>q.closest(`.i-block-helper${filter}`);

			if (el) {
				return el.component;
			}
		}

		return undefined;
	}
}
