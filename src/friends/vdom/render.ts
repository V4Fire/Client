/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';
import type { ComponentInterface } from 'super/i-block';

import type VDOM from 'friends/vdom/class';
import type { RenderFactory, RenderFn } from 'friends/vdom/interface';

/**
 * Renders the specified VNode and returns the result
 * @param vnode
 *
 * @example
 * ```js
 * const div = this.render(Vue.h('div', {class: 'foo'}));
 *
 * console.log(div.tagName); // DIV
 * console.log(div.classList.contains('foo')); // true
 * ```
 */
export function render(this: VDOM, vnode: VNode): Node;

/**
 * Renders the specified list of VNode-s and returns the result
 * @param vnodes
 *
 * @example
 * ```js
 * const divs = this.vdom.render([
 *   Vue.h('div', {class: 'foo'}),
 *   Vue.h('div', {class: 'bar'}),
 * ]);
 *
 * console.log(div[0].tagName); // DIV
 * console.log(div[1].classList.contains('bar')); // true
 * ```
 */
export function render(this: VDOM, vnodes: VNode[]): Node[];
export function render(this: VDOM, vnode: CanArray<VNode>): CanArray<Node> {
	return this.ctx.$renderEngine.r.render(Object.cast(vnode), this.ctx);
}

/**
 * Returns a render function factory by the specified path
 * @param path - a path to the render factory
 *
 * @example
 * ```js
 * // Returns the main render factory of bExample
 * this.getRenderFactory('bExample/');
 * this.getRenderFactory('bExample.index');
 *
 * this.getRenderFactory('bExample.subTemplate');
 * ```
 */
export function getRenderFactory(this: VDOM, path: string): CanUndef<RenderFactory> {
	const
		chunks = path.split('.');

		if (path.endsWith('/')) {
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
		tpl = TPLS[chunks[0]];

	if (tpl == null) {
		return;
	}

	const
		fn = Object.get(tpl, chunks.slice(1));

	if (Object.isFunction(fn)) {
		return fn();
	}
}

/**
 * Returns a render function using the specified factory or path
 *
 * @param factoryOrPath - the render factory or a path to it
 * @param [ctx] - a component context for rendering
 *
 * @example
 * ```js
 * this.getRenderFn(this.getRenderObject('bExample/'));
 * this.getRenderFn('bExample.subTemplate');
 * ```
 */
export function getRenderFn(
	this: VDOM,
	factoryOrPath: CanUndef<RenderFactory> | string,
	ctx: ComponentInterface = this.ctx
): RenderFn {
	const
		factory = Object.isString(factoryOrPath) ? getRenderFactory.call(this, factoryOrPath) : factoryOrPath;

	if (factory == null) {
		return () => this.ctx.$renderEngine.r.createCommentVNode('loopback');
	}

	const
		cache = [],
		instanceCtx = Object.create(ctx),
		render = factory(instanceCtx, cache);

	return (bindings) => {
		if (bindings != null) {
			for (let keys = Object.keys(bindings), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					value = bindings[key];

				if (key in ctx) {
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

		return Object.cast(render());
	};
}
