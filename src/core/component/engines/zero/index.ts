/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { createComponent } from 'core/component/composite';
import { ComponentOptions, DirectiveOptions, DirectiveFunction } from 'vue';
import { constructors, components } from 'core/component/const';
import { VNode, VNodeData, VNodeDirective } from 'vue/types/vnode';
import { VueConfiguration } from 'vue/types/vue';
export { default as minimalCtx } from 'core/component/engines/zero/ctx';

//#if VueInterfaces
export * from 'vue';
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export const supports = {
	functional: false
};

const
	$$ = symbolGenerator(),
	svgNms = 'http://www.w3.org/2000/svg',
	xlinkNms = 'http://www.w3.org/1999/xlink';

const
	eventModifiers = {'!': 'capture', '&': 'passive', '~': 'once'},
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);

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
		warnHandler: console.warn
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
		return {};
	}

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

				const baseCtx = Object.assign(Object.create(this), {
					props,
					$createElement: ComponentDriver.prototype.$createElement,

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
							slot = createTemplate();

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
					addClass(node, opts);
					attachEvents(node, opts.nativeOn);

					if (opts.ref) {
						refs[opts.ref] = ctx;
					}

					if (meta.params.inheritAttrs) {
						addAttrs(node, attrs);
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
				}

				return node || document.createComment('');
			}

			const el = tag === 'template' ? createTemplate() :
				tag === 'svg' ? document.createElementNS(svgNms, tag) : document.createElement(tag);

			el[$$.data] = opts;
			addDirectives(el, opts, opts.directives);

			if (el instanceof Element) {
				if (opts.ref) {
					refs[opts.ref] = el;
				}

				addClass(el, opts);
				attachEvents(el, opts.on);
			}

			addProps(el, opts.domProps);
			addAttrs(el, opts.attrs);

			if (el instanceof SVGElement) {
				children = createSVGChildren(<Element[]>children, this);
			}

			appendChild(el, children);
			return el;
		}

		return tag;
	}
}

function createSVGChildren(children: Element[], ctx: Dictionary): SVGElement[] {
	if (!children || !children.length) {
		return [];
	}

	const
		res = <ReturnType<typeof createSVGChildren>>[];

	for (let i = 0; i < children.length; i++) {
		const
			el = children[i],
			node = document.createElementNS(svgNms, el.tagName.toLowerCase()),
			data = el[$$.data];

		if (data) {
			addDirectives(node, el[$$.directives], data);
			addAttrs(node, el[$$.attrs]);
			attachEvents(node, el[$$.events]);

			if (el.className) {
				node.setAttributeNS(null, 'class', el.className);
			}

			if (data.ref && Object.isObject(ctx.refs)) {
				ctx.refs[data.ref] = el;
			}

			res.push(node);

		} else {
			res.push(<SVGElement>children[i]);
		}

		if (el.children) {
			appendChild(node, createSVGChildren(Array.from(el.children), ctx));
		}
	}

	return res;
}

function addDirectives(el: Element | DocumentFragmentP, data: VNodeData, directives?: VNodeDirective[]): void {
	if (!directives) {
		return;
	}

	el[$$.directives] = directives;

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			el = o[i];

		switch (el.name) {
			case 'show':
				if (!el.value) {
					data.attrs = data.attrs || {};
					data.attrs.style = (data.attrs.style || '') + ';display: none;';
				}

				break;

			case 'model':
				data.domProps = data.domProps || {};
				data.domProps.value = el.value;
		}
	}
}

function addProps(el: Element | DocumentFragmentP, props?: Dictionary<unknown>): void {
	if (!props) {
		return;
	}

	el[$$.props] = props;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const key = keys[i];
		el[key] = props[key];
	}
}

type DocumentFragmentP = DocumentFragment & {
	getAttribute(nm: string): void;
	setAttribute(nm: string, val: string): void;
};

function addAttrs(el: Element | DocumentFragmentP, attrs?: Dictionary<string>): void {
	if (!attrs) {
		return;
	}

	el[$$.attrs] = attrs;

	for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = attrs[key];

		if (val != null) {
			if (el instanceof SVGElement) {
				el.setAttributeNS(key.split(':')[0] === 'xlink' ? xlinkNms : null, key, val);

			} else {
				el.setAttribute(key, val);
			}
		}
	}
}

function createTemplate(): DocumentFragmentP {
	const
		el = <any>document.createDocumentFragment(),
		attrs = {};

	el.getAttribute = (key) => attrs[key];
	el.setAttribute = (key, val) => attrs[key] = val;

	return el;
}

function addClass(el: Element, opts: VNodeData): void {
	const className = (<string[]>[]).concat(
		el.getAttribute('class') || '',
		opts.staticClass || '',
		opts.class || []
	).join(' ').trim();

	if (className) {
		if (el instanceof SVGElement) {
			el.setAttributeNS(null, 'class', className);

		} else {
			el.setAttribute('class', className);
		}
	}
}

function attachEvents(el: Node, events?: Dictionary<CanArray<Function>>): void {
	if (!events) {
		return;
	}

	for (let keys = Object.keys(events), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mods = eventModifiersRgxp.exec(key),
			handlers = (<EventListener[]>[]).concat(<any>events[key] || []),
			flags = {};

		if (mods) {
			for (let o = mods[0], i = 0; i < o.length; i++) {
				flags[eventModifiers[o[i]]] = true;
			}
		}

		for (let i = 0; i < handlers.length; i++) {
			const
				fn = handlers[i];

			if (Object.isFunction(fn)) {
				const
					event = key.replace(eventModifiersRgxp, ''),
					cache = el[$$.events] = el[$$.events] || {};

				cache[event] = {fn, flags};
				el.addEventListener(event, fn, flags);
			}
		}
	}
}

function appendChild(parent: Node, node: CanArray<Node>): void {
	if (Object.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			appendChild(parent, node[i]);
		}

	} else {
		parent.appendChild(node);
	}
}
