/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';
import type { ComponentInterface } from 'components/super/i-block/i-block';

import type Friend from 'components/friends/friend';
import type { RenderFactory, RenderFn } from 'components/friends/vdom/interface';

/**
 * Renders the specified VNode and returns the result
 *
 * @param vnode
 * @param [group] - the name of the async group within which rendering takes place
 *
 * @example
 * ```js
 * const div = this.vdom.render(this.create('div', {attrs: {class: 'foo'}}));
 *
 * console.log(div.tagName); // DIV
 * console.log(div.classList.contains('foo')); // true
 * ```
 */
export function render(this: Friend, vnode: VNode, group?: string): Node;

/**
 * Renders the specified list of VNodes and returns the result
 *
 * @param vnodes
 * @param [group] - the name of the async group within which rendering takes place
 *
 * @example
 * ```js
 * const divs = this.vdom.render(this.vdom.create(
 *   {type: 'div', attrs: {class: 'foo'}},
 *   {type: 'div', attrs: {class: 'bar'}}
 * ));
 *
 * console.log(div[0].tagName); // DIV
 * console.log(div[1].classList.contains('bar')); // true
 * ```
 */
export function render(this: Friend, vnodes: VNode[], group?: string): Node[];

export function render(this: Friend, vnode: CanArray<VNode>, group?: string): CanArray<Node> {
	return this.ctx.$renderEngine.r.render(Object.cast(vnode), this.ctx, group);
}

/**
 * Returns a render function factory by the specified path.
 * This function is useful when you want to decompose your component template into separated render functions.
 *
 * @param path - a path to the render factory
 *
 * @example
 * ```js
 * // Returns the main render factory of bExample
 * this.vdom.getRenderFactory('bExample/');
 * this.vdom.getRenderFactory('bExample.index');
 *
 * this.vdom.getRenderFactory('bExample.subTemplate');
 * ```
 */
export function getRenderFactory(this: Friend, path: string): CanUndef<RenderFactory> {
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
		if (SSR) {
			this.ctx.hydrateStyles(chunks[0]);
		}

		return fn();
	}
}

/**
 * Returns a render function using the specified factory or path.
 * This function is useful when you want to decompose your component template into separated render functions.
 *
 * @param factoryOrPath - the render factory or a path to it
 * @param [ctx] - a component context for rendering
 *
 * @example
 * ```
 * - namespace [%fileName%]
 *
 * - include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder
 *
 * - template sayHello()
 *   < .hello
 *     Hello {{ p.name }}
 *
 * - template index() extends ['i-static-page.component'].index
 *   - block body
 *     /// Invokes the passed render function and joins the result fragment with the main fragment.
 *     /// Notice, you can pass parameters to another render function.
 *     < .content v-render = vdom.getRenderFn('pV4ComponentsDemo.sayHello')({p: {name: 'Bob'}})
 * ```
 */
export function getRenderFn(
	this: Friend,
	factoryOrPath: CanUndef<RenderFactory> | string,
	ctx: ComponentInterface = this.ctx
): RenderFn {
	const
		factory = Object.isString(factoryOrPath) ? getRenderFactory.call(this, factoryOrPath) : factoryOrPath;

	if (factory == null) {
		return () => this.ctx.$renderEngine.r.createCommentVNode('loopback');
	}

	const
		cache: unknown[] = [],
		instanceCtx = Object.create(ctx, {isVirtualTpl: {value: true}});

	Object.defineProperty(instanceCtx, '$slots', {
		configurable: true,
		enumerable: true,
		writable: true,
		value: {}
	});

	const render = factory(
		instanceCtx,
		SSR ? cache.push.bind(cache) : cache
	);

	return (bindings) => {
		if (bindings != null) {
			Object.entries(bindings).forEach(([key, value]) => {
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
			});
		}

		const renderResult = render();
		return SSR ? cache : renderResult;
	};
}
