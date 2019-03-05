/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { ComponentInterface } from 'core/component/interface';
import { minimalCtx, ComponentDriver, ComponentOptions, VNode } from 'core/component/engines';
import { createFakeCtx } from 'core/component/create/functional';
import { constructors, components } from 'core/component/const';
import {

	runHook,
	initDataObject,
	initPropsObject,
	bindWatchers,
	addMethodsFromMeta

} from 'core/component/create/helpers';

export type Composite<T = unknown> =
	[T?, ComponentInterface?];

const
	$$ = symbolGenerator();

/**
 * Creates a composite component by the specified parameters and returns a tuple [node, ctx]
 *
 * @param component - component object or a component name
 * @param ctx - base context
 * @param [parent] - parent context
 */
export function createComponent<T>(
	component: ComponentOptions<ComponentDriver> | string,
	ctx: ComponentInterface,
	parent?: ComponentInterface
): Composite<T> {
	const
		constr = constructors[Object.isString(component) ? component : String(component.name)],
		// @ts-ignore
		createElement = ctx.$createElement;

	if (!constr || !createElement) {
		return [];
	}

	let
		meta = components.get(constr);

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

	const baseCtx = Object.assign(Object.create(constr.prototype), minimalCtx, {
		meta,
		instance: meta.instance,
		componentName: meta.componentName
	});

	const
		fakeCtx = createFakeCtx<ComponentInterface>(createElement, renderCtx, baseCtx, true);

	// @ts-ignore
	meta = fakeCtx.meta;

	// @ts-ignore
	fakeCtx.hook = 'created';

	// @ts-ignore
	meta.params.functional = true;
	bindWatchers(fakeCtx);

	runHook('created', meta, fakeCtx).then(async () => {
		if (methods.created) {
			await methods.created.fn.call(fakeCtx);
		}
	}, stderr);

	const
		node = render.call(fakeCtx, createElement);

	// @ts-ignore
	fakeCtx.$el = node;
	node.component = fakeCtx;

	const
		// @ts-ignore
		{$async: $a} = fakeCtx,
		watchRoot = document.body;

	let
		mounted;

	const mount = () => {
		if (mounted) {
			return;
		}

		// @ts-ignore
		fakeCtx.hook = 'mounted';
		mounted = true;
		bindWatchers(fakeCtx);

		runHook('mounted', <NonNullable<typeof meta>>meta, fakeCtx).then(async () => {
			if (methods.mounted) {
				await methods.mounted.fn.call(fakeCtx);
			}
		}, stderr);
	};

	const destroy = () => {
		// @ts-ignore
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
						$a.setImmediate(() => {
							if (!document.body.contains(el)) {
								destroy();
							}
						}, {
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

const defField = {
	configurable: true,
	enumerable: true,
	writable: true,
	value: undefined
};

export function applyComposites(vnode: VNode, ctx: ComponentInterface): void {
	// @ts-ignore
	if (!ctx.$compositeI) {
		return;
	}

	const search = (vnode, parent?, pos?) => {
		const
			attrs = vnode.data && vnode.data.attrs || {},
			composite = attrs['v4-composite'];

		if (parent && composite) {
			const
				constr = constructors[composite];

			if (constr) {
				const
					meta = components.get(constr);

				if (meta) {
					const
						nodeAttrs = vnode.data && vnode.data.attrs,
						propsObj = meta.component.props;

					const
						attrs = {},
						props = {};

					for (let keys = Object.keys(propsObj), i = 0; i < keys.length; i++) {
						props[keys[i]] = undefined;
					}

					if (nodeAttrs) {
						for (let keys = Object.keys(nodeAttrs), i = 0; i < keys.length; i++) {
							const
								key = keys[i],
								prop = key.camelize(false),
								val = nodeAttrs[key];

							if (propsObj[prop]) {
								props[prop] = val;
								delete nodeAttrs[key];

							} else {
								attrs[key] = val;
							}
						}
					}

					const
						proto = constr.prototype,
						tpl = TPLS[composite] || proto.render;

					const fakeCtx = Object.assign(Object.create(ctx), {
						meta,
						hook: 'beforeDataCreate',
						componentStatusStore: 'unloaded',
						instance: meta.instance,
						componentName: meta.componentName
					});

					Object.defineProperty(fakeCtx, '$attrs', {value: attrs});
					Object.defineProperty(fakeCtx, '$parent', {value: ctx});
					Object.defineProperty(fakeCtx, '$slots', {value: {default: vnode.children}});

					for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							value = props[key];

						Object.defineProperty(fakeCtx, key, value !== undefined ? {...defField, value} : defField);
					}

					const
						{methods, systemFields} = meta;

					for (let keys = Object.keys(systemFields), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							val = systemFields[key];

						if (val && (val.unique && val.replace !== true || val.replace === false)) {
							Object.defineProperty(fakeCtx, key, defField);
						}
					}

					addMethodsFromMeta(meta, fakeCtx, true);
					initPropsObject(propsObj, fakeCtx, meta.instance, fakeCtx, true);
					initDataObject(systemFields, fakeCtx, meta.instance, fakeCtx);
					initDataObject(meta.fields, fakeCtx, meta.instance, fakeCtx);

					runHook('created', meta, ctx).then(async () => {
						if (methods.created) {
							await methods.created.fn.call(ctx);
						}
					}, stderr);

					ctx.meta.hooks.mounted.unshift({
						fn: () => {
							runHook('mounted', meta, ctx).then(async () => {
								if (methods.mounted) {
									await methods.mounted.fn.call(ctx);
								}
							}, stderr);
						}
					});

					parent.children[pos] = fakeCtx.vdom
						.execRenderObject(tpl.index(), [fakeCtx]);
				}
			}

			// @ts-ignore
			if (!--ctx.$compositeI) {
				return;
			}
		}

		const
			{children} = vnode;

		if (children) {
			for (let i = 0; i < children.length; i++) {
				search(children[i], vnode, i);

				// @ts-ignore
				if (!ctx.$compositeI) {
					return;
				}
			}
		}
	};

	search(vnode);
}
