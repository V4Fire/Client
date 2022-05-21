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
	createElementVNode,

	createBlock,
	createElementBlock,

	renderList,
	withDirectives,

	VNode,
	DirectiveArguments

} from 'core/component/engines';

import { registerComponent } from 'core/component/register';
import { createVNodeWithDirectives, interpolateStaticAttrs } from 'core/component/render/vnode';
import { isSpecialComponent } from 'core/component/render/helpers';

import type { ComponentInterface } from 'core/component/interface';

export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return Object.cast(function createVNode(this: ComponentInterface, type: string, ...args: unknown[]) {
		const vnode = createVNodeWithDirectives(original, type, ...args);
		return interpolateStaticAttrs.call(this, vnode);
	});
}

export function wrapCreateElementVNode<T extends typeof createElementVNode>(original: T): T {
	return Object.cast(function createElementVNode(this: ComponentInterface) {
		// eslint-disable-next-line prefer-spread
		return interpolateStaticAttrs.call(this, original.apply(null, arguments));
	});
}

export function wrapCreateBlock<T extends typeof createBlock>(original: T): T {
	return Object.cast(function wrapCreateBlock(this: ComponentInterface) {
		// eslint-disable-next-line prefer-spread
		return interpolateStaticAttrs.call(this, original.apply(null, arguments));
	});
}

export function wrapCreateElementBlock<T extends typeof createElementBlock>(original: T): T {
	return Object.cast(function createElementBlock(this: ComponentInterface) {
		// eslint-disable-next-line prefer-spread
		return interpolateStaticAttrs.call(this, original.apply(null, arguments));
	});
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

export function wrapRenderList<T extends typeof renderList>(original: T): T {
	return Object.cast(function renderList(
		this: ComponentInterface,
		src: Iterable<unknown> | Dictionary,
		cb: AnyFunction
	) {
		this.$emit('[[V_FOR_CB]]', cb);
		return original(src, cb);
	});
}

export function wrapWithDirectives<T extends typeof withDirectives>(original: T): T {
	return Object.cast(function withDirectives(this: ComponentInterface, vnode: VNode, dirs: DirectiveArguments) {
		const
			resolvedDirs: DirectiveArguments = [];

		for (let i = 0; i < dirs.length; i++) {
			const
				decl = dirs[i],
				[dir, value, arg, modifiers] = decl;

			const
				cantIgnoreDir = value != null || decl.length !== 2;

			if (Object.isDictionary(dir)) {
				if (Object.isFunction(dir.beforeCreate)) {
					dir.beforeCreate({value, arg, modifiers, dir, instance: this}, vnode);

					if (Object.keys(dir).length > 1 && cantIgnoreDir) {
						resolvedDirs.push(decl);
					}

				} else if (Object.keys(dir).length > 0 && cantIgnoreDir) {
					resolvedDirs.push(decl);
				}

			} else if (cantIgnoreDir) {
				resolvedDirs.push(decl);
			}
		}

		return original(vnode, resolvedDirs);
	});
}
