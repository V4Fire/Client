/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from '@src/core/symbol';
import { HAS_WINDOW } from '@src/core/env';

import type Vue from 'vue';
import type { ComponentOptions } from 'vue';

import * as init from '@src/core/component/construct';

import { fillMeta } from '@src/core/component/meta';
import { createFakeCtx } from '@src/core/component/functional';

import { components } from '@src/core/component/const';
import type { ComponentInterface, ComponentMeta } from '@src/core/component/interface';

import { document, supports, minimalCtx } from '@src/core/component/engines/zero/const';
import { cloneVNode, patchVNode, renderVNode } from '@src/core/component/engines';

const
	$$ = symbolGenerator();

/**
 * Returns a component declaration object from the specified meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<Vue> {
	const
		{component} = fillMeta(meta);

	const
		p = meta.params,
		m = p.model;

	return {
		...Object.cast(component),
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
 * @param ctx - context of the component to create
 */
export async function createComponent<T>(
	component: ComponentOptions<Vue> | string,
	ctx: ComponentInterface
): Promise<[T?, ComponentInterface?]> {
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
		componentName: meta.componentName,
		$renderEngine: {
			supports,
			minimalCtx,
			cloneVNode,
			patchVNode,
			renderVNode
		}
	});

	const fakeCtx = createFakeCtx<ComponentInterface>(createElement, Object.create(ctx), baseCtx, {
		initProps: true
	});

	init.createdState(fakeCtx);

	const
		node = await render.call(fakeCtx, createElement);

	// @ts-ignore (access)
	// eslint-disable-next-line require-atomic-updates
	fakeCtx['$el'] = node;
	node.component = fakeCtx;

	return [node, fakeCtx];
}

/**
 * Mounts a component to the specified node
 *
 * @param nodeOrSelector - link to the parent node to mount or a selector
 * @param componentNode - link to the rendered component node
 * @param ctx - context of the component to mount
 */
export function mountComponent(nodeOrSelector: string | Node, [componentNode, ctx]: [Node, ComponentInterface]): void {
	if (!HAS_WINDOW) {
		return;
	}

	const parentNode = Object.isString(nodeOrSelector) ?
		document.querySelector(nodeOrSelector) :
		nodeOrSelector;

	if (parentNode == null) {
		return;
	}

	const {
		unsafe,
		unsafe: {$async: $a}
	} = ctx;

	const is = (el): boolean =>
		el === parentNode ||
		el.parentNode === parentNode ||
		el.contains(parentNode);

	if (typeof MutationObserver === 'function') {
		const observer = new MutationObserver((mutations) => {
			for (let i = 0; i < mutations.length; i++) {
				const
					mut = mutations[i];

				for (let o = mut.addedNodes, j = 0; j < o.length; j++) {
					const
						node = o[j];

					if (!(node instanceof Element)) {
						continue;
					}

					if (is(node)) {
						mount();

					} else {
						const
							childComponentId = getChildComponentId(node);

						if (childComponentId != null) {
							unsafe.$emit(`child-component-mounted:${childComponentId}`);
						}
					}
				}

				for (let o = mut.removedNodes, j = 0; j < o.length; j++) {
					const
						node = o[j];

					if (!(node instanceof Element)) {
						continue;
					}

					if (is(node)) {
						$a.setTimeout(() => {
							if (!document.body.contains(node)) {
								unsafe.$destroy();
							}

						}, 0, {
							label: $$.removeFromDOM
						});

					} else {
						const
							childComponentId = getChildComponentId(node);

						if (childComponentId != null) {
							unsafe.$emit(`child-component-destroyed:${childComponentId}`);
						}
					}
				}
			}
		});

		observer.observe(parentNode, {
			childList: true,
			subtree: true
		});

		$a.worker(observer);

	} else {
		$a.on(parentNode, 'DOMNodeInserted', ({srcElement}) => {
			if (is(srcElement)) {
				mount();

			} else {
				const
					childComponentId = getChildComponentId(srcElement);

				if (childComponentId != null) {
					unsafe.$emit(`child-component-mounted:${childComponentId}`);
				}
			}
		});

		$a.on(parentNode, 'DOMNodeRemoved', ({srcElement}) => {
			if (is(srcElement)) {
				unsafe.$destroy();

			} else {
				const
					childComponentId = getChildComponentId(srcElement);

				if (childComponentId != null) {
					unsafe.$emit(`child-component-destroyed:${childComponentId}`);
				}
			}
		});
	}

	parentNode.appendChild(componentNode);

	let
		mounted = false;

	function mount(): void {
		if (mounted) {
			return;
		}

		mounted = true;
		init.mountedState(ctx);
	}

	function getChildComponentId(node: Element): CanUndef<string> {
		if (!node.classList.contains('i-block-helper')) {
			return;
		}

		const
			classes = node.className.split(/\s+/);

		for (let i = 0; i < classes.length; i++) {
			const
				classVal = classes[i];

			if (!classVal.startsWith('uid-')) {
				continue;
			}

			if (classVal !== unsafe.componentId) {
				return classVal;
			}
		}
	}
}
