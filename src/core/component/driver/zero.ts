/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getCompositeCtx } from 'core/component/composite';
import { ComponentOptions, DirectiveOptions, DirectiveFunction } from 'vue';
import { VNode, VNodeData } from 'core/component/driver';

//#if VueInterfaces
export * from 'vue';
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export const minimalCtx = {
	_v: (v) => document.createTextNode(v),
	_s: (v) => v == null ? '' : String(v),
	_e: (v) => document.createComment(v === undefined ? '' : v),
	_t(name: string, fallback: CanArray<Element>, props?: Dictionary, bindObject?: Dictionary): Element[] {
		const
			scopedSlotFn = this.$scopedSlots[name];

		let
			nodes;

		if (scopedSlotFn) {
			props = props || {};

			if (bindObject) {
				props = {...bindObject, ...props};
			}

			nodes = scopedSlotFn(props) || fallback;

		} else {
			const
				slotNodes = this.$slots[name];

			if (slotNodes) {
				slotNodes._rendered = true;
			}

			nodes = slotNodes || fallback;
		}

		const
			target = props && props.slot;

		if (target) {
			return this.$createElement('template', {slot: target}, nodes);
		}

		return nodes;
	}
};

const
	isComponent = /^[bg]-/,
	eventModifiers = {'!': 'capture', '&': 'passive', '~': 'once'},
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);

export class ComponentDriver {
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
			[res] = getCompositeCtx<Element>(opts, this);

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
		tag: string | Element,
		attrs?: VNodeData | Element[],
		children?: Element[]
	): Element {
		if (Object.isString(tag)) {
			let
				opts: VNodeData;

			if (Object.isObject(attrs)) {
				children = (<Element[]>[]).concat(children || []);
				opts = <VNodeData>attrs;

			} else {
				children = (<Element[]>[]).concat(attrs || []);
				opts = {};
			}

			if (isComponent.test(tag) || opts.tag === 'component') {
				console.log(children[0].getAttribute('slot'));

				const [node = minimalCtx._e(''), ctx] = getCompositeCtx<Element>(tag, Object.assign(Object.create(this), {
					props: opts.attrs,

					slots() {
						if (!children || !children.length) {
							return {};
						}

						const
							f = children[0];

						console.log(121, f);

						if (children[0].slot) {

						}
					},

					data: {
						attrs: opts.attrs
					}
				}));

				if (opts.nativeOn) {
					attachEvents(node, opts.nativeOn);
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

				return node || minimalCtx._e('');
			}

			const
				el = tag === 'template' ? createTemplate() : document.createElement(tag);

			if (opts.directives) {
				for (let o = opts.directives, i = 0; i < o.length; i++) {
					const
						el = o[i];

					switch (el.name) {
						case 'show':
							if (!el.value) {
								opts.attrs = opts.attrs || {};
								opts.attrs.style = (opts.attrs.style || '') + ';display: none;';
							}

							break;

						case 'model':
							opts.domProps = opts.domProps || {};
							opts.domProps.value = el.value;
					}
				}
			}

			if (opts.attrs) {
				for (let o = opts.attrs, keys = Object.keys(o), i = 0; i < keys.length; i++) {
					const key = keys[i];
					el.setAttribute(key, o[key]);
				}
			}

			if (opts.domProps) {
				for (let o = opts.domProps, keys = Object.keys(o), i = 0; i < keys.length; i++) {
					const key = keys[i];
					el[key] = o[key];
				}
			}

			if (!(el instanceof DocumentFragment)) {
				if (opts.ref) {
					const r = this.$refs = <Dictionary>this.$refs || {};
					r[opts.ref] = el;
				}

				const
					className = (<string[]>[]).concat(opts.staticClass || '', opts.class || []).join(' ').trim();

				if (className) {
					el.className = className;
				}

				if (opts.on) {
					attachEvents(el, opts.on);
				}
			}

			appendChild(el, children);
			return el;
		}

		return tag;
	}
}

function createTemplate(): Element {
	const
		el = document.createDocumentFragment(),
		attrs = {};

	el.getAttribute = (key) => attrs[key];
	el.setAttribute = (key, val) => attrs[key] = val;

	return el;
}

function attachEvents(el: Element, events: Dictionary<CanArray<Function>>): void {
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
				el.addEventListener(key.replace(eventModifiersRgxp, ''), fn, flags);
			}
		}
	}
}

function appendChild(parent: Element, node: CanArray<Element>): void {
	if (Object.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			appendChild(parent, node[i]);
		}

	} else {
		parent.appendChild(node);
	}
}
