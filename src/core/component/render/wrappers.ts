/* eslint-disable prefer-spread, prefer-rest-params */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as c from 'core/component/const';

import { attachTemplatesToMeta } from 'core/component/meta';
import { createVirtualContext } from 'core/component/functional';

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

import { registerComponent } from 'core/component/init';
import { interpolateStaticAttrs } from 'core/component/render/helpers';

import type { ComponentInterface } from 'core/component/interface';

export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return Object.cast(function createVNode(this: ComponentInterface, ...args: Parameters<T>) {
		return interpolateStaticAttrs.call(this, original.apply(null, args));
	});
}

export function wrapCreateElementVNode<T extends typeof createElementVNode>(original: T): T {
	return Object.cast(function createElementVNode(this: ComponentInterface, ...args: Parameters<T>) {
		return interpolateStaticAttrs.call(this, original.apply(null, args));
	});
}

export function wrapCreateBlock<T extends typeof createBlock>(original: T): T {
	return Object.cast(function wrapCreateBlock(this: ComponentInterface, ...args: Parameters<T>) {
		const
			[name] = args,
			{supports, r} = this.$renderEngine;

		const
			supportFunctionalComponents = !supports.regular || supports.functional;

		if (Object.isString(name) && supportFunctionalComponents) {
			const
				component = registerComponent(name);

			if (component?.params.functional === true) {
				const
					{componentName} = component;

				if (c.componentRenderFactories[componentName] == null) {
					attachTemplatesToMeta(component, TPLS[componentName]);
				}

				const virtualCtx = createVirtualContext(component, {
					parent: this,
					props: args[1],
					slots: args[2]
				});

				const
					vnode: VNode = original.apply(null, args),
					functionalVNode = virtualCtx.render(virtualCtx, []);

				vnode.type = functionalVNode.type;
				vnode.props = functionalVNode.props;
				vnode.children = functionalVNode.children;
				vnode.dynamicChildren = functionalVNode.dynamicChildren;

				vnode.dirs = functionalVNode.dirs ?? [];
				vnode.dirs.push({
					dir: Object.cast(r.resolveDirective.call(virtualCtx, 'hook')),

					modifiers: {},
					arg: undefined,

					value: {
						created: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'created', n),
						beforeMount: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeMount', n),
						mounted: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'mounted', n),
						beforeUpdate: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeUpdate', n),
						updated: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'updated', n),
						beforeUnmount: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeDestroy', n),
						unmounted: (n) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'destroyed', n)
					},

					oldValue: undefined,
					instance: Object.cast(virtualCtx)
				});

				functionalVNode.props = {};
				functionalVNode.dirs = null;
				functionalVNode.children = [];
				functionalVNode.dynamicChildren = [];

				return vnode;
			}
		}

		return interpolateStaticAttrs.call(this, original.apply(null, args));
	});
}

export function wrapCreateElementBlock<T extends typeof createElementBlock>(original: T): T {
	return Object.cast(function createElementBlock(this: ComponentInterface, ...args: Parameters<T>) {
		return interpolateStaticAttrs.call(this, original.apply(null, args));
	});
}

export function wrapResolveComponent<T extends typeof resolveComponent | typeof resolveDynamicComponent>(
	original: T
): T {
	return Object.cast((name, ...args) => {
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
					const
						newVnode = dir.beforeCreate({value, arg, modifiers, dir, instance: this}, vnode);

					if (newVnode != null) {
						vnode = newVnode;
					}

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
