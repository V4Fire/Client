/* eslint-disable prefer-spread, prefer-rest-params */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as c from 'core/component/const';

import { attachTemplatesToMeta, ComponentMeta } from 'core/component/meta';
import { createVirtualContext } from 'core/component/functional';

import type {

	resolveComponent,
	resolveDynamicComponent,

	createVNode,
	createElementVNode,

	createBlock,
	createElementBlock,

	renderList,
	renderSlot,

	withDirectives,

	VNode,
	DirectiveArguments,
	DirectiveBinding

} from 'core/component/engines';

import { registerComponent } from 'core/component/init';
import { resolveAttrs, normalizeComponentAttrs } from 'core/component/render/helpers';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Wrapper for the component library `createVNode` function
 * @param original
 */
export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return wrapCreateBlock(original);
}

/**
 * Wrapper for the component library `createElementVNode` function
 * @param original
 */
export function wrapCreateElementVNode<T extends typeof createElementVNode>(original: T): T {
	return Object.cast(function createElementVNode(this: ComponentInterface, ...args: Parameters<T>) {
		return resolveAttrs.call(this, original.apply(null, args));
	});
}

/**
 * Wrapper for the component library `createBlock` function
 * @param original
 */
export function wrapCreateBlock<T extends typeof createBlock>(original: T): T {
	return Object.cast(function wrapCreateBlock(this: ComponentInterface, ...args: Parameters<T>) {
		const
			[name, attrs, slots] = args;

		let
			component: CanUndef<ComponentMeta>;

		if (Object.isString(name)) {
			component = registerComponent(name);

		} else if (!Object.isPrimitive(name) && 'name' in name) {
			component = registerComponent(name.name);
		}

		const
			vnode = resolveAttrs.call(this, original.apply(null, args));

		if (component == null) {
			return vnode;
		}

		normalizeComponentAttrs(attrs, component);

		const
			{componentName, params} = component,
			{supports, r} = this.$renderEngine;

		if ((!supports.regular || supports.functional) && params.functional === true) {
			if (c.componentRenderFactories[componentName] == null) {
				attachTemplatesToMeta(component, TPLS[componentName]);
			}

			const virtualCtx = createVirtualContext(component, {
				parent: this,
				props: attrs,
				slots
			});

			vnode.virtualComponent = virtualCtx;

			const
				functionalVNode = virtualCtx.render(virtualCtx, []);

			vnode.type = functionalVNode.type;
			vnode.props = {...vnode.props, ...functionalVNode.props};
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

			if (functionalVNode.shapeFlag > vnode.shapeFlag) {
				// eslint-disable-next-line no-bitwise
				vnode.shapeFlag |= functionalVNode.shapeFlag;
			}

			if (functionalVNode.patchFlag > vnode.patchFlag) {
				// eslint-disable-next-line no-bitwise
				vnode.patchFlag |= functionalVNode.patchFlag;
			}

			functionalVNode.props = {};
			functionalVNode.dirs = null;
			functionalVNode.children = [];
			functionalVNode.dynamicChildren = [];
		}

		return vnode;
	});
}

/**
 * Wrapper for the component library `createElementBlock` function
 * @param original
 */
export function wrapCreateElementBlock<T extends typeof createElementBlock>(original: T): T {
	return Object.cast(function createElementBlock(this: ComponentInterface, ...args: Parameters<T>) {
		return resolveAttrs.call(this, original.apply(null, args));
	});
}

/**
 * Wrapper for the component library `resolveComponent` or `resolveDynamicComponent` functions
 * @param original
 */
export function wrapResolveComponent<T extends typeof resolveComponent | typeof resolveDynamicComponent>(
	original: T
): T {
	return Object.cast((name, ...args) => {
		registerComponent(name);
		return original(name, ...args);
	});
}

/**
 * Wrapper for the component library `renderList` function
 * @param original
 */
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

/**
 * Wrapper for the component library `renderSlot` function
 * @param original
 */
export function wrapRenderSlot<T extends typeof renderSlot>(original: T): T {
	return Object.cast(function renderSlot(this: ComponentInterface, ...args: Parameters<T>) {
		const
			{r} = this.$renderEngine;

		if (this.meta.params.functional === true) {
			try {
				return original.apply(null, args);

			} catch {
				const [
					slots,
					name,
					props,
					fallback
				] = args;

				const children = slots[name]?.(props) ?? fallback?.() ?? [];
				return r.createBlock.call(this, r.Fragment, {key: props?.key ?? `_${name}`}, children);
			}
		}

		return original.apply(null, args);
	});
}

/**
 * Wrapper for the component library `withDirectives` function
 * @param _
 */
export function wrapWithDirectives<T extends typeof withDirectives>(_: T): T {
	return Object.cast(function withDirectives(
		this: CanUndef<ComponentInterface>,
		vnode: VNode,
		dirs: DirectiveArguments
	) {
		if (this == null) {
			Object.defineProperty(vnode, 'virtualComponent', {
				configurable: true,
				enumerable: true,
				get: () => vnode.el?.component
			});

		} else if (!('virtualContext' in vnode)) {
			Object.defineProperty(vnode, 'virtualContext', {
				configurable: true,
				enumerable: true,
				writable: true,
				value: this
			});
		}

		const bindings = vnode.dirs ?? [];
		vnode.dirs = bindings;

		const instance = this?.unsafe.meta.params.functional === true ?
			Object.cast(this.$normalParent) :
			this;

		dirs.forEach((decl) => {
			const
				[dir, value, arg, modifiers] = decl;

			const binding: DirectiveBinding = {
				dir: Object.isFunction(dir) ? {created: dir, mounted: dir} : dir,
				instance: Object.cast(instance),

				value,
				oldValue: undefined,

				arg,
				modifiers: modifiers ?? {}
			};

			const
				cantIgnoreDir = value != null || decl.length !== 2;

			if (Object.isDictionary(dir)) {
				if (Object.isFunction(dir.beforeCreate)) {
					const
						newVnode = dir.beforeCreate(binding, vnode);

					if (newVnode != null) {
						vnode = newVnode;
					}

					if (Object.keys(dir).length > 1 && cantIgnoreDir) {
						bindings.push(binding);
					}

				} else if (Object.keys(dir).length > 0 && cantIgnoreDir) {
					bindings.push(binding);
				}

			} else if (cantIgnoreDir) {
				bindings.push(binding);
			}
		});

		return vnode;
	});
}
