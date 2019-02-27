/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { patchVNode, execRenderObject, RenderObject, RenderContext, VNode } from 'core/component';

export default class VDOM {
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
	findElFromVNode<T extends iBlock>(
		vnode: VNode,
		elName: string,
		// @ts-ignore
		ctx: T = this.component
	): CanUndef<VNode> {
		const
			selector = ctx.provide.fullElName(elName);

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
	 * Executes the specified render object
	 *
	 * @param renderObj
	 * @param [ctx] - render context
	 */
	execRenderObject(
		renderObj: RenderObject,
		ctx?: RenderContext | [Dictionary] | [Dictionary, RenderContext]
	): VNode {
		let
			instanceCtx,
			renderCtx;

		if (ctx && Object.isArray(ctx)) {
			instanceCtx = ctx[0] || this;
			renderCtx = ctx[1];

		} else {
			instanceCtx = this;
			renderCtx = ctx;
		}

		const
			vnode = execRenderObject(renderObj, instanceCtx);

		if (renderCtx) {
			return patchVNode(vnode, instanceCtx, renderCtx);
		}

		return vnode;
	}
}
