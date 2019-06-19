/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//tslint:disable:no-string-literal

import symbolGenerator from 'core/symbol';

import { components } from 'core/component/const';
import { ComponentInterface } from 'core/component/interface';
import { getComponentDataFromVnode } from 'core/component/create/composite';
import { runHook } from 'core/component/create/helpers';
import { createFakeCtx } from 'core/component/create/functional';

import config from 'core/component/engines/zero/config';
import minimalCtx from 'core/component/engines/zero/ctx';
import * as _ from 'core/component/engines/zero/helpers';

//#if VueInterfaces
import Vue, { ComponentOptions, DirectiveOptions, DirectiveFunction, RenderContext } from 'vue';
import { VNode, VNodeData as BaseVNodeData } from 'vue/types/vnode';

export * from 'vue';
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export { minimalCtx };

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
	functional: false,
	composite: true
};

export const options: Options = {
	filters: {},
	directives: {}
};

const
	$$ = symbolGenerator();

export class ComponentDriver {
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
			[res] = createComponent<Element>(opts, <any>this);

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
		this: ComponentInterface,
		tag: string | Node,
		attrs?: VNodeData | Node[],
		children?: Node[]
	): Node {
		if (Object.isString(tag)) {
			const
				// @ts-ignore (access)
				refs = this.$refs = this.$refs || {};

			let
				opts: VNodeData;

			if (Object.isSimpleObject(attrs)) {
				children = (<Node[]>[]).concat(children || []);
				opts = <VNodeData>attrs;

			} else {
				children = (<Node[]>[]).concat(attrs || []);
				opts = {};
			}

			const
				meta = components.get(tag);

			const getSlots = () => {
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
					slot = _.createTemplate();
					_.appendChild(slot, Array.from(children));
				}

				res.default = slot;
				return res;
			};

			if (meta) {
				const
					data = <VNodeData>getComponentDataFromVnode(meta.componentName, <any>{data: opts});

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
					node[_.$$.data] = node['data'] = opts;

					node['elm'] = node;
					node['context'] = ctx;

					_.addStaticDirectives(this, opts, data.directives, node);
					_.addDirectives(this, node, opts, data.directives);
					_.addClass(node, data);
					_.attachEvents(node, data.nativeOn);
					_.addStyles(node, data.style);

					if (data.ref) {
						if (data.refInFor) {
							const arr = refs[data.ref] = <typeof ctx[]>(refs[data.ref] || []);
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
							fns = (<Function[]>[]).concat(o[key]);

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

				return node || document.createComment('');
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

/**
 * Renders the specified data
 *
 * @param data
 * @param parent - parent component
 */
export function renderData(data: VNode, parent: ComponentInterface): Node;
export function renderData(data: VNode[], parent: ComponentInterface): Node[];
export function renderData(data: CanArray<VNode>, parent: ComponentInterface): CanArray<Node> {
	return <any>data;
}

/**
 * Clones the specified vnode
 * @param vnode
 */
export function cloneVNode(vnode: VNode): VNode {
	return (<any>vnode).cloneNode(true);
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vNode
 * @param ctx - component fake context
 * @param renderCtx - render context
 */
export function patchVNode(vNode: Element, ctx: ComponentInterface, renderCtx: RenderContext): void {
	const
		{data} = renderCtx,
		// @ts-ignore (access)
		{meta} = ctx;

	_.addClass(vNode, data);

	if (data.attrs && meta.params.inheritAttrs) {
		_.addAttrs(vNode, data.attrs);
	}

	_.addStaticDirectives(ctx, data, vNode[_.$$.directives], vNode);
}

const
	minimalCtxCache = Object.createDict();

/**
 * Creates a zero component by the specified parameters and returns a tuple [node, ctx]
 *
 * @param component - component object or a component name
 * @param ctx - base context
 * @param [parent] - parent context
 */
export function createComponent<T>(
	component: ComponentOptions<Vue> | string,
	ctx: ComponentInterface,
	parent?: ComponentInterface
): [T?, ComponentInterface?] {
	const
		// @ts-ignore (access)
		createElement = ctx.$createElement;

	if (!createElement) {
		return [];
	}

	let
		meta = components.get(Object.isString(component) ? component : String(component.name));

	if (!meta) {
		return [];
	}

	const
		{methods, component: {render}} = meta;

	if (!render) {
		return [];
	}

	const
		ctxShim = {parent},
		renderCtx = Object.create(ctx);

	for (let keys = Object.keys(ctxShim), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = ctxShim[key],
			val = renderCtx[key];

		if (val) {
			if (Object.isObject(el)) {
				// tslint:disable-next-line:prefer-object-spread
				renderCtx[key] = Object.assign(el, val);
			}

		} else {
			renderCtx[key] = el;
		}
	}

	const baseCtx = minimalCtxCache[meta.componentName] = minimalCtxCache[meta.componentName] || Object.assign(
		Object.create(meta.constructor.prototype), minimalCtx, {
			meta,
			instance: meta.instance,
			componentName: meta.componentName
		}
	);

	const fakeCtx = createFakeCtx<ComponentInterface>(createElement, renderCtx, baseCtx, {
		initProps: true,
		safe: true
	});

	// @ts-ignore (access)
	meta = fakeCtx.meta;
	meta.params.functional = true;

	// @ts-ignore (access)
	fakeCtx.hook = 'created';

	runHook('created', meta, fakeCtx).then(() => {
		if (methods.created) {
			return methods.created.fn.call(fakeCtx);
		}
	}, stderr);

	const
		node = render.call(fakeCtx, createElement);

	// @ts-ignore (access)
	fakeCtx.$el = node;
	node.component = fakeCtx;

	const
		// @ts-ignore (access)
		{$async: $a} = fakeCtx,
		watchRoot = document.body;

	let
		mounted;

	const mount = () => {
		if (mounted) {
			return;
		}

		mounted = true;
		runHook('mounted', <NonNullable<typeof meta>>meta, fakeCtx).then(() => {
			if (methods.mounted) {
				return methods.mounted.fn.call(fakeCtx);
			}
		}, stderr);
	};

	const destroy = () => {
		// @ts-ignore (access)
		fakeCtx.$destroy();
	};

	const
		is = (el) => el === node || el.contains(node);

	if (typeof MutationObserver === 'function') {
		const observer = new MutationObserver((mutations) => {
			for (let i = 0; i < mutations.length; i++) {
				const
					mut = mutations[i];

				if (!mounted) {
					for (let o = mut.addedNodes, j = 0; j < o.length; j++) {
						if (is(o[j])) {
							mount();
							break;
						}
					}
				}

				if (fakeCtx.keepAlive) {
					break;
				}

				for (let o = mut.removedNodes, j = 0; j < o.length; j++) {
					const
						el = o[j];

					if (is(el)) {
						$a.setTimeout(() => {
							if (!document.body.contains(el)) {
								destroy();
							}
						}, 0, {
							label: $$.removeFromDOM
						});

						break;
					}
				}
			}
		});

		observer.observe(watchRoot, {
			childList: true,
			subtree: true
		});

		$a.worker(observer);

	} else {
		$a.on(watchRoot, 'DOMNodeInserted', ({srcElement}) => {
			if (is(srcElement)) {
				mount();
			}
		});

		$a.on(watchRoot, 'DOMNodeRemoved', ({srcElement}) => {
			if (is(srcElement)) {
				destroy();
			}
		});
	}

	return [node, fakeCtx];
}
