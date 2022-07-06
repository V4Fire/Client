/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding, VNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

/**
 * Returns a directive context associated with the directive
 *
 * @param binding - the directive binding
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveContext(
	binding: Nullable<DirectiveBinding>,
	vnode: Nullable<VNode>
): CanUndef<ComponentInterface['unsafe']> {
	return Object.cast(vnode?.virtualContext ?? binding?.instance);
}

/**
 * Returns a component context associated with the directive
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveComponent(vnode: Nullable<VNode>): CanUndef<ComponentInterface['unsafe']> {
	if (vnode == null) {
		return undefined;
	}

	return Object.cast(vnode.virtualComponent ?? vnode.component?.['ctx']);
}
