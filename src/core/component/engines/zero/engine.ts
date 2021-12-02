/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { identity } from '~/core/functools/helpers';
import type { ComponentOptions, DirectiveOptions, DirectiveFunction } from 'vue';

import { registerComponent } from '~/core/component/register';
import type { ComponentInterface } from '~/core/component/interface';

import config from '~/core/component/engines/zero/config';
import * as _ from '~/core/component/engines/zero/helpers';

import { options, document } from '~/core/component/engines/zero/const';
import { getComponent, createComponent, mountComponent } from '~/core/component/engines/zero/component';

import type { VNodeData } from '~/core/component/engines/zero/interface';

export class ComponentEngine {
	/**
	 * Component options
	 */
	$options: Dictionary = {...options};

	/**
	 * Engine configuration
	 */
	static config: typeof config = config;

	/**
	 * Renders a component with specified name and input properties
	 *
	 * @param name
	 * @param [props]
	 */
	static async render(name: string, props?: Dictionary): Promise<{ctx: ComponentEngine; node: CanUndef<Element>}> {
		let
			meta = registerComponent(name);

		if (meta == null) {
			throw new ReferenceError(`A component with the name "${name}" is not found`);
		}

		if (props != null) {
			meta = Object.create(meta);

			const metaProps = {...meta!.props};
			meta!.props = metaProps;

			Object.forEach(props, (val, key) => {
				const
					prop = metaProps[key];

				if (prop != null) {
					metaProps[key] = {...prop, default: val};
				}
			});
		}

		const
			ctx = new this(),
			node = await ctx.$render(getComponent(meta!));

		return {ctx, node};
	}

	/**
	 * Register a component with the specified name and parameters
	 *
	 * @param name
	 * @param params
	 */
	static component(name: string, params: any): Promise<ComponentOptions<any>> {
		if (Object.isFunction(params)) {
			return new Promise(params);
		}

		return Promise.resolve(params);
	}

	/**
	 * Register a directive with the specified name and parameters
	 *
	 * @param name
	 * @param [params]
	 */
	static directive(name: string, params?: DirectiveOptions | DirectiveFunction): DirectiveOptions {
		const
			obj = <DirectiveOptions>{};

		if (Object.isFunction(params)) {
			obj.bind = params;
			obj.update = params;

		} else if (params) {
			Object.assign(obj, params);
		}

		options.directives[name] = obj;
		return obj;
	}

	/**
	 * Register a filter with the specified name
	 *
	 * @param name
	 * @param [value]
	 */
	static filter(name: string, value?: Function): Function {
		return options.filters[name] = value ?? identity;
	}

	/**
	 * @param [opts]
	 */
	constructor(opts?: ComponentOptions<any>) {
		if (opts == null) {
			return;
		}

		const
			{el} = opts;

		this.$render(opts).then(() => {
			if (el == null) {
				return;
			}

			this.$mount(el);
		}).catch(stderr);
	}

	/**
	 * Renders the current component
	 * @param opts - component options
	 */
	async $render(opts: ComponentOptions<any>): Promise<CanUndef<Element>> {
		const res = await createComponent<Element>(opts, Object.create(this));
		this[_.$$.renderedComponent] = res;
		return res[0];
	}

	/**
	 * Mounts the current component to the specified node
	 * @param nodeOrSelector - link to the parent node to mount or a selector
	 */
	$mount(nodeOrSelector: string | Node): void {
		const
			renderedComponent = this[_.$$.renderedComponent];

		if (renderedComponent == null) {
			return;
		}

		mountComponent(nodeOrSelector, renderedComponent);
	}

	/**
	 * Creates an element or component by the specified parameters
	 *
	 * @param tag - name of the tag or component to create
	 * @param [tagDataOrChildren] - additional data for the tag or component
	 * @param [children] - list of child elements
	 */
	$createElement(
		this: ComponentInterface,
		tag: string | Node,
		tagDataOrChildren?: VNodeData | Node[],
		children?: Array<CanPromise<Node>>
	): CanPromise<Node> {
		if (Object.isString(tag)) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			const refs = this.$refs ?? {};

			// @ts-ignore (access)
			this.$refs = refs;

			let
				tagData: VNodeData;

			if (Object.isSimpleObject(tagDataOrChildren)) {
				children = Array.concat([], children);
				tagData = <VNodeData>tagDataOrChildren;

			} else {
				children = Array.concat([], tagDataOrChildren);
				tagData = {};
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

				node.data = {...tagData, slots: getSlots()};
				node[_.$$.data] = node.data;

				node.elm = node;
				node.context = this;

				_.addDirectives(this, node, tagData, tagData.directives);
				_.addStaticDirectives(this, tagData, tagData.directives, node);

				if (node instanceof Element) {
					_.addToRefs(node, tagData, refs);
					_.addClass(node, tagData);
					_.attachEvents(node, tagData.on);
				}

				_.addProps(node, tagData.domProps);
				_.addStyles(node, tagData.style);
				_.addAttrs(node, tagData.attrs);

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
						firstChild = <CanUndef<Element | Text>>children[0];

					if (firstChild == null) {
						return res;
					}

					const hasSlotAttr =
						'getAttribute' in firstChild && firstChild.getAttribute('slot') != null;

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
