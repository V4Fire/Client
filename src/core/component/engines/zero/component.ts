/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

//#if VueInterfaces
import Vue, { ComponentOptions } from 'vue';
//#endif

import { runHook } from 'core/component/hook';
import { fillMeta } from 'core/component/meta';
import { createFakeCtx } from 'core/component/functional';

import { components } from 'core/component/const';
import { ComponentInterface, ComponentMeta } from 'core/component/interface';

import minimalCtx from 'core/component/engines/zero/context';
import { minimalCtxCache } from 'core/component/engines/zero/const';

const
	$$ = symbolGenerator();

/**
 * Returns a component declaration object from the specified component meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<Vue> {
	const
		p = meta.params,
		m = p.model;

	const
		{component} = fillMeta(meta);

	return {
		...<ComponentOptions<any>>Any(component),
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			event: m.event?.dasherize() ?? ''
		}
	};
}

/**
 * Creates a zero component by the specified parameters and returns a tuple [node, ctx]
 *
 * @param component - component declaration object or a component name
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

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (createElement == null) {
		return [];
	}

	let
		meta = components.get(Object.isString(component) ? component : String(component.name));

	if (meta == null) {
		return [];
	}

	const
		{methods, component: {render}} = meta;

	if (render == null) {
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

		if (val != null) {
			if (Object.isPlainObject(el)) {
				// tslint:disable-next-line:prefer-object-spread
				renderCtx[key] = Object.assign(el, val);
			}

		} else {
			renderCtx[key] = el;
		}
	}

	const baseCtx = minimalCtxCache[meta.componentName] ?? Object.assign(
		Object.create(minimalCtx), {
			meta,
			isFlyweight: true,
			instance: meta.instance,
			componentName: meta.componentName
		}
	);

	minimalCtxCache[meta.componentName] = baseCtx;

	const fakeCtx = createFakeCtx<ComponentInterface>(createElement, renderCtx, baseCtx, {
		initProps: true
	});

	// @ts-ignore (access)
	meta = fakeCtx.meta;
	meta.params.functional = true;

	// @ts-ignore (access)
	fakeCtx['hook'] = 'created';

	runHook('created', fakeCtx).then(() => {
		if (methods.created) {
			return methods.created.fn.call(fakeCtx);
		}
	}, stderr);

	const
		node = render.call(fakeCtx, createElement);

	// @ts-ignore (access)
	fakeCtx['$el'] = node;
	node.component = fakeCtx;

	const
		// @ts-ignore (access)
		{$async: $a} = fakeCtx,
		watchRoot = document.body;

	let
		mounted = false;

	const mount = () => {
		if (mounted) {
			return;
		}

		mounted = true;
		runHook('mounted', fakeCtx).then(() => {
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
		is = (el): boolean => el === node || el.contains(node);

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
