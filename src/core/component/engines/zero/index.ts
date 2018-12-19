/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createComponent } from 'core/component/composite';
import { ComponentOptions, DirectiveOptions, DirectiveFunction, RenderContext } from 'vue';
import { constructors, components } from 'core/component/const';
import { VNode, VNodeData as BaseVNodeData } from 'vue/types/vnode';
import { VueConfiguration } from 'vue/types/vue';
import * as _ from 'core/component/engines/zero/helpers';
export { default as minimalCtx } from 'core/component/engines/zero/ctx';

//#if VueInterfaces
export * from 'vue';
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export interface VNodeData extends BaseVNodeData {
	model?: {
		expression: string;
		value: unknown;
		callback(value: unknown): void;
	};
}

export interface Options extends Dictionary {
	filters: Dictionary<Function>;
	directives: Dictionary<DirectiveOptions>;
}

export const supports = {
	functional: false
};

export const options: Options = {
	filters: {},
	directives: {}
};

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vNode
 * @param ctx - component fake context
 * @param renderCtx - render context
 */
export function patchVNode(vNode: Element, ctx: Dictionary<any>, renderCtx: RenderContext): void {
	const
		{data} = renderCtx,
		{meta} = ctx;

	_.addClass.call(ctx, vNode, data);

	if (data.attrs && meta.params.inheritAttrs) {
		_.addAttrs.call(ctx, vNode, data.attrs);
	}

	_.addDirectives.call(ctx, vNode, data);
}

export class ComponentDriver {
	static config: VueConfiguration = {
		silent: true,
		devtools: false,
		productionTip: false,
		performance: false,
		optionMergeStrategies: {},
		keyCodes: {},
		ignoredElements: [],
		errorHandler: console.error,
		warnHandler: console.warn,
		async: false
	};

	/**
	 * Shim for Vue.component
	 *
	 * @param id
	 * @param factory
	 */
	static component(id: string, factory: any): Promise<ComponentOptions<any>> {
		if (Object.isFunction(factory)) {
			return new Promise(factory);
		}

		return Promise.resolve(factory);
	}

	/**
	 * Shim for Vue.directive
	 *
	 * @param id
	 * @param [definition]
	 */
	static directive(id: string, definition?: DirectiveOptions | DirectiveFunction): DirectiveOptions {
		const
			obj = <DirectiveOptions>{};

		if (Object.isFunction(definition)) {
			obj.bind = definition;
			obj.update = definition;

		} else if (definition) {
			Object.assign(obj, definition);
		}

		options.directives[id] = obj;
		return obj;
	}

	/**
	 * Shim for Vue.filter
	 *
	 * @param id
	 * @param [definition]
	 */
	static filter(id: string, definition?: Function): Function {
		return options.filters[id] = definition || Any;
	}

	/**
	 * Component options
	 */
	$options: Dictionary = {...options};

	/**
	 * @param opts
	 */
	constructor(opts: ComponentOptions<any>) {
		const
			{el} = opts,
			[res] = createComponent<Element, ComponentDriver>(opts, this);

		if (el && res) {
			if (Object.isString(el)) {
				const
					node = document.querySelector(el);

				if (node) {
					node.appendChild(res);
				}

				return;
			}

			el.appendChild(res);
		}
	}

	/**
	 * Shim for Vue.$createElement
	 *
	 * @param tag
	 * @param attrs
	 * @param children
	 */
	$createElement(
		this: Dictionary<unknown>,
		tag: string | Node,
		attrs?: VNodeData | Node[],
		children?: Node[]
	): Node {
		if (Object.isString(tag)) {
			const
				refs = this.$refs = <Dictionary>this.$refs || {};

			let
				opts: VNodeData;

			if (Object.isObject(attrs)) {
				children = (<Node[]>[]).concat(children || []);
				opts = <VNodeData>attrs;

			} else {
				children = (<Node[]>[]).concat(attrs || []);
				opts = {};
			}

			const
				constr = constructors[tag],
				meta = constr && components.get(constr);

			if (meta) {
				const
					props = {},
					attrs = {};

				if (opts.attrs) {
					for (let o = opts.attrs, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							nm = key.camelize(false),
							val = o[key];

						if (meta.props[nm]) {
							props[nm] = val;

						} else {
							attrs[key] = val;
						}
					}
				}

				const
					componentModel = meta.params.model;

				if (opts.model && componentModel) {
					const
						{prop, event} = componentModel;

					if (prop && event) {
						props[prop] = opts.model.value;
						opts.on = opts.on || {};
						opts.on[event] = opts.model.callback;
					}
				}

				const baseCtx = Object.assign(Object.create(this), {
					props,

					$createElement: ComponentDriver.prototype.$createElement,
					$options: {...options},

					data: {
						attrs,
						on: opts.on
					},

					slots: () => {
						const
							res = <Dictionary>{};

						if (!children || !children.length) {
							return res;
						}

						const
							f = <Element>children[0];

						if (f.getAttribute && f.getAttribute('slot')) {
							for (let i = 0; i < children.length; i++) {
								const
									slot = <Element>children[i],
									key = slot.getAttribute('slot');

								if (!key) {
									continue;
								}

								res[key] = slot;
							}

							return res;
						}

						let
							slot;

						if (children.length === 1) {
							slot = f;

						} else {
							slot = _.createTemplate.call(this);

							for (let o = Array.from(children), i = 0; i < o.length; i++) {
								slot.appendChild(o[i]);
							}
						}

						res.default = slot;
						return res;
					},

					scopedSlots: () => {
						const
							res = {};

						if (opts.scopedSlots) {
							for (let o = opts.scopedSlots, keys = Object.keys(o), i = 0; i < keys.length; i++) {
								const key = keys[i];
								res[key] = o[key];
							}
						}

						return res;
					}
				});

				const [node, ctx] =
					createComponent<Element, ComponentDriver>(tag, baseCtx, <ComponentDriver>this);

				if (node) {
					node[_.$$.data] = opts;

					_.addDirectives.call(this, node, opts, opts.directives);
					_.addClass.call(this, node, opts);
					_.attachEvents.call(this, node, opts.nativeOn);
					_.addStyles.call(this, node, opts.style);

					if (opts.ref) {
						refs[opts.ref] = ctx;
					}

					if (meta.params.inheritAttrs) {
						_.addAttrs.call(this, node, attrs);
					}
				}

				if (opts.on) {
					for (let o = opts.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							fns = (<Function[]>[]).concat(o[key]);

						for (let i = 0; i < fns.length; i++) {
							const
								fn = fns[i];

							if (Object.isFunction(fn)) {
								// @ts-ignore
								ctx.$on(key, fn);
							}
						}
					}
				}

				return node || document.createComment('');
			}

			let
				el;

			switch (tag) {
				case 'template':
					el = _.createTemplate.call(this);
					break;

				case 'svg':
					el = document.createElementNS(_.SVG_NMS, tag);
					break;

				default:
					el = document.createElement(tag);
			}

			el[_.$$.data] = opts;
			_.addDirectives.call(this, el, opts, opts.directives);

			if (el instanceof Element) {
				if (opts.ref) {
					refs[opts.ref] = el;
				}

				_.addClass.call(this, el, opts);
				_.attachEvents.call(this, el, opts.on);
			}

			_.addProps.call(this, el, opts.domProps);
			_.addStyles.call(this, el, opts.style);
			_.addAttrs.call(this, el, opts.attrs);

			if (el instanceof SVGElement) {
				children = _.createSVGChildren.call(this, <Element[]>children, this);
			}

			_.appendChild.call(this, el, children);
			return el;
		}

		return tag;
	}
}
