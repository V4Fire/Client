/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	resolveComponent,
	resolveDynamicComponent,

	createVNode,
	withDirectives,

	VNode,
	DirectiveArguments

} from 'core/component/engines';

import { registerComponent } from 'core/component/register';
import { createVNodeWithDirectives } from 'core/component/render/vnode';
import { isSpecialComponent } from 'core/component/render/helpers';

import type { ComponentInterface } from 'core/component/interface';

export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return Object.cast((type, ...args) => createVNodeWithDirectives(original, type, ...args));
}

export function wrapResolveComponent<T extends typeof resolveComponent | typeof resolveDynamicComponent>(
	original: T
): T {
	return Object.cast((name, ...args) => {
		if (isSpecialComponent(name)) {
			return name;
		}

		registerComponent(name);
		return original(name, ...args);
	});
}

export function wrapWithDirectives<T extends typeof withDirectives>(original: T): T {
	return Object.cast(function withDirectives(this: ComponentInterface, vnode: VNode, dirs: DirectiveArguments) {
		const
			resolvedDirs: DirectiveArguments = [];

		for (let i = 0; i < dirs.length; i++) {
			const
				decl = dirs[i];

			const
				[dir, value, arg, modifiers] = dirs[i];

			if (Object.isDictionary(dir)) {
				if (Object.isFunction(dir.beforeCreate)) {
					dir.beforeCreate({value, arg, modifiers, dir, instance: this}, vnode);

					if (Object.keys(dir).length > 1 && value != null) {
						resolvedDirs.push(decl);
					}

				} else if (Object.keys(dir).length > 0 && value != null) {
					resolvedDirs.push(decl);
				}

			} else if (value != null) {
				resolvedDirs.push(decl);
			}
		}

		return original(vnode, resolvedDirs);
	});
}
