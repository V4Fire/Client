/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { createVNode, resolveComponent, withDirectives } from 'vue';

import * as comp from 'core/component/render/components';

import { isSpecialComponent } from 'core/component/render/wrappers/helpers';

export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return Object.cast((type, ...args) => comp.createVNodeWithDirectives(original, type, ...args));
}

export function wrapResolveComponent<T extends typeof resolveComponent>(original: T): T {
	return Object.cast((name, ...args) => {
		if (isSpecialComponent(name)) {
			return name;
		}

		return original(name, ...args);
	});
}

export function wrapWithDirectives<T extends typeof withDirectives>(original: T): T {
	return Object.cast(function withDirectives(vnode, dirs) {
		for (let i = 0; i < dirs.length; i++) {
			const
				[dir, value, arg, modifiers] = dirs[i];

			if (dir.beforeCreate != null) {
				dir.beforeCreate({value, arg, modifiers, dir, instance: this}, vnode);
			}
		}

		return original(vnode, dirs);
	});
}
