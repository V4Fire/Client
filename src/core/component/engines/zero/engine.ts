/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { identity } from 'core/functools/helpers';
import type { ComponentOptions, DirectiveOptions, DirectiveFunction } from 'vue';

import { components } from 'core/component/const';
import type { ComponentInterface } from 'core/component/interface';

import config from 'core/component/engines/zero/config';
import * as _ from 'core/component/engines/zero/helpers';

import { options, document } from 'core/component/engines/zero/const';
import { getComponent, createComponent } from 'core/component/engines/zero/component';

import type { VNodeData } from 'core/component/engines/zero/interface';

export class ComponentEngine {
	/**
	 * Component options
	 */
	$options: Dictionary = {...options};

	static config: typeof config = config;

	/**
	 * @param name
	 */
	static async render(name: string): Promise<CanUndef<Element>> {
		const
			meta = components.get(name);

		if (meta == null) {
			throw new ReferenceError(`A component with the name "${name}" is not found`);
		}

		return (new this()).$render(getComponent(meta));
	}

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
	 * @param [opts]
	 */
	constructor(opts: ComponentOptions<any> = {}) {
		const
			{el} = opts;

		if (el == null) {
			return;
		}

		(async () => {
			const
				res = await this.$render(opts);

			if (res == null) {
				return;
			}

			if (Object.isString(el)) {
				const
					node = document.querySelector(el);

				if (node != null) {
					node.appendChild(res);
				}

				return;
			}

			el.appendChild(res);
		})();
	}

	/**
	 * Renders the component and returns the result
	 * @param opts - component options
	 */
	async $render(opts: ComponentOptions<any>): Promise<CanUndef<Element>> {
		const [res] = await createComponent<Element>(opts, Object.create(this));
		return res;
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
		children?: Array<CanPromise<Node>>
	): CanPromise<Node> {
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

			const createNode = (children: Node[]) => {
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

				node.data = {...opts, slots: getSlots()};
				node[_.$$.data] = node.data;

				node.elm = node;
				node.context = this;

				_.addStaticDirectives(this, opts, opts.directives, node);
				_.addDirectives(this, node, opts, opts.directives);

				if (node instanceof Element) {
					if (opts.ref != null) {
						if (opts.refInFor) {
							const arr = <Element[]>(refs[opts.ref] ?? []);
							refs[opts.ref] = arr;

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

				function getSlots(): Dictionary {
					const
						res = <Dictionary>{};

					if (children.length === 0) {
						return res;
					}

					const
						firstChild = <Element | Text>children[0];

					const hasSlotAttr =
						'getAttribute' in firstChild &&
						firstChild.getAttribute('slot') != null;

					if (hasSlotAttr) {
						for (let i = 0; i < children.length; i++) {
							const
								slot = <Element>children[i],
								key = slot.getAttribute('slot');

							if (key == null) {
								continue;
							}

							res[key] = slot;
						}

						return res;
					}

					let
						slot;

					if (children.length === 1) {
						slot = firstChild;

					} else {
						slot = _.createTemplate();
						_.appendChild(slot, Array.from(children));
					}

					res.default = slot;
					return res;
				}
			};

			if (children.length > 0) {
				children = children.flat();

				// eslint-disable-next-line @typescript-eslint/unbound-method
				if (children.some(Object.isPromise)) {
					return Promise.all<Node>(children).then((children) => createNode(children));
				}
			}

			return createNode(<Node[]>children);
		}

		return tag;
	}
}
