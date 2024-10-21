/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentContext } from 'core/component/context';

import type { DirectiveBinding, VNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

/**
 * Returns the unique directive identifier for the passed element
 *
 * @param el - the element to which the directive applies
 * @param idsCache - the store for the registered elements
 */
export function getElementId(el: Element, idsCache: WeakMap<Element, string>): string {
	let id = idsCache.get(el);

	if (id == null) {
		id = Object.fastHash(Math.random());
		idsCache.set(el, id);
	}

	return id;
}

/**
 * Returns the context of the component within which the directive is being used
 *
 * @param binding - the directive binding
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveContext(
	binding: Nullable<DirectiveBinding>,
	vnode: Nullable<VNode>
): CanNull<ComponentInterface['unsafe']> {
	return Object.cast(binding?.virtualContext ?? vnode?.virtualContext ?? binding?.instance ?? null);
}

/**
 * Returns the context of the component to which the directive is applied.
 * If the directive is applied to a regular node instead of a component, `null` will be returned.
 *
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveComponent(vnode: Nullable<VNode>): CanNull<ComponentInterface['unsafe']> {
	if (vnode == null) {
		return null;
	}

	if (vnode.el?.component != null) {
		return vnode.el.component;
	}

	if (vnode.virtualComponent != null) {
		return Object.cast(vnode.virtualComponent);
	}

	const component = vnode.component?.['ctx'];

	if (component != null) {
		return getComponentContext(component, true).unsafe;
	}

	return null;
}
