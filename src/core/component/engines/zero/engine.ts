/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { identity } from 'core/functools/helpers';

import {

	ComponentOptions,
	DirectiveOptions,
	DirectiveFunction

} from 'vue';

import config from 'core/component/engines/zero/config';

import { getComponentDataFromVNode } from 'core/component/vnode';

import { components } from 'core/component/const';
import { ComponentInterface } from 'core/component/interface';

import * as _ from 'core/component/engines/zero/helpers';

import { options } from 'core/component/engines/zero/const';
import { createComponent } from 'core/component/engines/zero/component';
import { VNodeData } from 'core/component/engines/zero/interface';

export class ComponentDriver {
	/**
	 * Component options
	 */
	$options: Dictionary = {...options};

	static config: typeof config = config;

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
		return options.filters[id] = definition ?? identity;
	}

	/**
	 * @param opts
	 */
	constructor(opts: ComponentOptions<any>) {
		const
			{el} = opts,
			[res] = createComponent<Element>(opts, <any>this);

		if (el != null && res != null) {
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
		this: ComponentInterface,
		tag: string | Node,
		attrs?: VNodeData | Node[],
		children?: Node[]
	): Node {
		if (Object.isString(tag)) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const refs = this.$refs ?? {};

			// @ts-ignore (access)
			this.$refs = refs;

			let
				opts: VNodeData;

			if (Object.isSimpleObject(attrs)) {
				children = Array.concat([], children);
				opts = <VNodeData>attrs;

			} else {
				children = Array.concat([], attrs);
				opts = {};
			}

			const
				meta = components.get(tag);

			const getSlots = () => {
				const
					res = <Dictionary>{};

				if (children == null || children.length === 0) {
					return res;
				}

				const
					f = <CanUndef<Element>>children[0];

				if (f?.getAttribute('slot') != null) {
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
					slot = _.createTemplate();
					_.appendChild(slot, Array.from(children));
				}

				res.default = slot;
				return res;
			};

			if (meta) {
				const
					data = <VNodeData>getComponentDataFromVNode(meta.componentName, <any>{data: opts});

				const baseCtx = Object.assign(Object.create(this), {
					props: data.props,

					$createElement: ComponentDriver.prototype.$createElement,
					$listeners: data.on,
					$options: {...options},

					data: {
						attrs: data.attrs,
						on: data.on
					},

					slots: getSlots,
					scopedSlots: () => data.scopedSlots
				});

				const [node, ctx] =
					createComponent<Element>(tag, baseCtx, this);

				if (node) {
					node['data'] = opts;
					node[_.$$.data] = opts;

					node['elm'] = node;
					node['context'] = ctx;

					_.addStaticDirectives(this, opts, data.directives, node);
					_.addDirectives(this, node, opts, data.directives);
					_.addClass(node, data);
					_.attachEvents(node, data.nativeOn);
					_.addStyles(node, data.style);

					if (Object.isTruly(data.ref)) {
						if (data.refInFor) {
							const arr = <typeof ctx[]>(refs[data.ref] || []);

							refs[data.ref] = arr;
							arr.push(ctx);

						} else {
							refs[data.ref] = ctx;
						}
					}

					if (meta.params.inheritAttrs) {
						_.addAttrs(node, data.attrs);
					}
				}

				if (opts.on) {
					for (let o = opts.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							fns = Array.concat([], o[key]);

						for (let i = 0; i < fns.length; i++) {
							const
								fn = fns[i];

							if (Object.isFunction(fn)) {
								// @ts-ignore (access)
								ctx.$on(key, fn);
							}
						}
					}
				}

				return node ?? document.createComment('');
			}

			let
				node;

			switch (tag) {
				case 'template':
					node = _.createTemplate();
					break;

				case 'svg':
					node = document.createElementNS(_.SVG_NMS, tag);
					break;

				default:
					node = document.createElement(tag);
			}

			node[_.$$.data] = node.data = {
				...opts,
				slots: getSlots()
			};

			node.elm = node;
			node.context = this;

			_.addStaticDirectives(this, opts, opts.directives, node);
			_.addDirectives(this, node, opts, opts.directives);

			if (node instanceof Element) {
				if (opts.ref) {
					if (opts.refInFor) {
						const arr = refs[opts.ref] = <Element[]>(refs[opts.ref] || []);
						arr.push(node);

					} else {
						refs[opts.ref] = node;
					}
				}

				_.addClass(node, opts);
				_.attachEvents(node, opts.on);
			}

			_.addProps(node, opts.domProps);
			_.addStyles(node, opts.style);
			_.addAttrs(node, opts.attrs);

			if (node instanceof SVGElement) {
				children = _.createSVGChildren(this, <Element[]>children);
			}

			_.appendChild(node, children);

			return node;
		}

		return tag;
	}
}
