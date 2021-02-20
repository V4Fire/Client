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

import * as init from 'core/component/construct';

import { fillMeta } from 'core/component/meta';
import { createFakeCtx } from 'core/component/functional';

import { components } from 'core/component/const';
import { ComponentInterface, ComponentMeta } from 'core/component/interface';

import minimalCtx from 'core/component/engines/zero/context';

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
 */
export function createComponent<T>(
	component: ComponentOptions<Vue> | string,
	ctx: ComponentInterface
): [T?, ComponentInterface?] {
	const
		// @ts-ignore (access)
		createElement = ctx.$createElement;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (createElement == null) {
		return [];
	}

	const
		meta = components.get(Object.isString(component) ? component : String(component.name));

	if (meta == null) {
		return [];
	}

	const
		{component: {render}} = meta;

	if (render == null) {
		return [];
	}

	const baseCtx = Object.assign(Object.create(minimalCtx), {
		meta,
		instance: meta.instance,
		componentName: meta.componentName
	});

	const fakeCtx = createFakeCtx<ComponentInterface>(createElement, Object.create(ctx), baseCtx, {
		initProps: true
	});

	const {
		unsafe,
		unsafe: {$async: $a}
	} = fakeCtx;

	init.createdState(fakeCtx);

	const
		node = render.call(fakeCtx, createElement);

	// @ts-ignore (access)
	fakeCtx['$el'] = node;
	node.component = fakeCtx;

	const
		watchRoot = document.body,
		is = (el): boolean => el === node || el.contains(node);

	let
		mounted = false;

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

				for (let o = mut.removedNodes, j = 0; j < o.length; j++) {
					const
						el = o[j];

					if (is(el)) {
						$a.setTimeout(() => {
							if (!document.body.contains(el)) {
								unsafe.$destroy();
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
				unsafe.$destroy();
			}
		});
	}

	function mount(): void {
		if (mounted) {
			return;
		}

		mounted = true;
		init.mountedState(fakeCtx);
	}

	return [node, fakeCtx];
}
