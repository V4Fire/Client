/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/vdom/README.md]]
 * @packageDocumentation
 */

import {

	renderData,
	patchVNode,
	execRenderObject,

	RenderObject,
	VNode,
	ScopedSlot

} from 'core/component';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import Opt from 'super/i-block/modules/opt';
import Field from 'super/i-block/modules/field';
import Provide from 'super/i-block/modules/provide';

import { tplCache } from 'super/i-block/modules/vdom/const';
import { RenderFn, RenderPath, RenderContext } from 'super/i-block/modules/vdom/interface';

export * from 'super/i-block/modules/vdom/interface';

/**
 * Class provides API to work with a VDOM tree
 */
export default class VDOM extends Friend {
	/**
	 * Renders the specified data
	 * @param data
	 *
	 * @example
	 * ```js
	 * this.render(this.$createElement('b-example', {
	 *   attrs: {
	 *     prop1: 'foo'
	 *   }
	 * }));
	 * ```
	 */
	render(data: VNode): Node;
	render(data: VNode[]): Node[];
	render(data: CanArray<VNode>): CanArray<Node> {
		return renderData(<any>data, this.ctx);
	}

	/**
	 * Returns a render object by the specified path
	 * @param path - path to a template
	 *
	 * @example
	 * ```js
	 * // Returns the main render object of bExample
	 * this.getRenderObject('bExample');
	 *
	 * this.getRenderObject('bExample.subTemplate');
	 * ```
	 */
	getRenderObject(path: string): CanUndef<RenderObject> {
		const
			chunks = path.split('.');

		if (path.slice(-1) === '/') {
			const l = chunks.length - 1;
			chunks[l] = chunks[l].slice(0, -1);
			chunks.push('index');
		}

		if (chunks.length === 1) {
			chunks.unshift(this.ctx.componentName);

		} else {
			chunks[0] = chunks[0].dasherize();
		}

		const
			key = chunks.join('.'),
			cache = tplCache[key];

		if (cache) {
			return cache;
		}

		const
			tpl = TPLS[chunks[0]];

		if (!tpl) {
			return;
		}

		const
			fn = Object.get(tpl, chunks.slice(1));

		if (Object.isFunction(fn)) {
			return tplCache[key] = fn();
		}
	}

	/**
	 * Returns a function that executes the specified render object
	 *
	 * @param objOrPath - render object or path to a template
	 * @param [ctx] - render context
	 *
	 * @example
	 * ```js
	 * this.bindRenderObject(this.getRenderObject('bExample'));
	 * this.bindRenderObject('bExample.subTemplate');
	 * ```
	 */
	bindRenderObject(objOrPath: RenderPath, ctx?: RenderContext): RenderFn {
		const
			renderObj = Object.isString(objOrPath) ? this.getRenderObject(objOrPath) : objOrPath;

		if (!renderObj) {
			return () => this.ctx.$createElement('span');
		}

		let
			instanceCtx,
			renderCtx;

		if (ctx && Object.isArray(ctx)) {
			instanceCtx = ctx[0] || this.ctx;
			renderCtx = ctx[1];

			if (instanceCtx !== instanceCtx.provide.component) {
				instanceCtx.field = new Field(instanceCtx);
				instanceCtx.provide = new Provide(instanceCtx);
				instanceCtx.opts = new Opt(instanceCtx);
			}

		} else {
			instanceCtx = this.ctx;
			renderCtx = ctx;
		}

		return (p) => {
			if (p) {
				instanceCtx = Object.create(instanceCtx);

				for (let keys = Object.keys(p), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						value = p[key];

					if (key in instanceCtx) {
						Object.defineProperty(instanceCtx, key, {
							configurable: true,
							enumerable: true,
							writable: true,
							value
						});

					} else {
						instanceCtx[key] = value;
					}
				}
			}

			const
				vnode = execRenderObject(renderObj, instanceCtx);

			if (renderCtx) {
				patchVNode(vnode, instanceCtx, renderCtx);
			}

			return vnode;
		};
	}

	/**
	 * Executes the specified render object
	 *
	 * @param objOrPath - render object or path to a template
	 * @param [ctx] - render context
	 *
	 * @example
	 * ```js
	 * this.execRenderObject(this.getRenderObject('bExample'));
	 * this.execRenderObject('bExample.subTemplate');
	 * ```
	 */
	execRenderObject(objOrPath: RenderPath, ctx?: RenderContext): VNode {
		return this.bindRenderObject(objOrPath, ctx)();
	}

	/**
	 * Returns a link to the closest parent component from the current
	 * @param component - component name or a link to the component constructor
	 */
	closest<T extends iBlock = iBlock>(component: string | ClassConstructor<T> | Function): CanUndef<T> {
		const
			nm = Object.isString(component) ? component.dasherize() : undefined;

		let
			el = <CanUndef<T>>this.ctx.$parent;

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
	findElFromVNode(
		vnode: VNode,
		elName: string,
		ctx: iBlock = this.component
	): CanUndef<VNode> {
		const
			selector = ctx.provide.fullElName(elName);

		const search = (vnode) => {
			const
				data = vnode.data || {};

			const classes = Object.fromArray(
				Array.concat([], (data.staticClass || '').split(' '), data.class)
			);

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
	 * Returns a slot by the specified name
	 *
	 * @param name
	 * @param [ctx] - component context to get the slot
	 */
	getSlot(
		name: string,
		ctx: iBlock = this.component
	): CanUndef<VNode | ScopedSlot> {
		return Object.get(ctx, `$slots.${name}`) || Object.get(ctx, `$scopedSlots.${name}`);
	}
}
