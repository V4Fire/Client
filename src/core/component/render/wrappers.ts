/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable prefer-spread */

import { app, isComponent, componentRenderFactories } from 'core/component/const';
import { attachTemplatesToMeta, ComponentMeta } from 'core/component/meta';

import { isSmartComponent } from 'core/component/reflect';
import { createVirtualContext } from 'core/component/functional';

import type {

	resolveComponent,
	resolveDynamicComponent,

	createVNode,
	createElementVNode,

	createBlock,
	createElementBlock,

	mergeProps,
	renderList,
	renderSlot,

	withCtx,
	withDirectives,
	resolveDirective,

	VNode,
	DirectiveArguments,
	DirectiveBinding

} from 'core/component/engines';

import { registerComponent } from 'core/component/init';
import { resolveAttrs, normalizeComponentAttrs, mergeProps as merge } from 'core/component/render/helpers';

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
		let
			[name, attrs, slots, patchFlag, dynamicProps] = args;

		let
			component: CanNull<ComponentMeta> = null;

		if (Object.isString(name)) {
			component = registerComponent(name);

		} else if (!Object.isPrimitive(name) && 'name' in name) {
			component = registerComponent(name.name);
		}

		const createVNode: (...args: Parameters<typeof createBlock>) => VNode = (
			type,
			props,
			children,
			patchFlag,
			dynamicProps
		) => {
			const vnode = original(type, props, children, patchFlag, dynamicProps);
			return resolveAttrs.call(this, vnode);
		};

		if (component == null) {
			return createVNode(name, attrs, slots, patchFlag, dynamicProps);
		}

		attrs = normalizeComponentAttrs(attrs, dynamicProps, component);

		const
			{componentName, params} = component,
			{r} = this.$renderEngine;

		const
			isRegular = params.functional !== true,
			vnode = createVNode(name, attrs, isRegular ? slots : [], patchFlag, dynamicProps);

		vnode.props ??= {};
		vnode.props.getRoot ??= () =>
			('getRoot' in this ? this.getRoot?.() : null) ??
			this.$root;

		vnode.props.getParent ??= () => vnode.virtualParent?.value != null ?
			vnode.virtualParent.value :
			this;

		if (vnode.ref != null && vnode.ref.i == null) {
			vnode.ref.i ??= {
				refs: this.$refs,
				setupState: {}
			};
		}

		if (isRegular) {
			return vnode;
		}

		if (componentRenderFactories[componentName] == null) {
			attachTemplatesToMeta(component, TPLS[componentName]);
		}

		const virtualCtx = createVirtualContext(component, {
			parent: this,
			props: attrs,
			slots
		});

		vnode.virtualComponent = virtualCtx;

		const
			declaredProps = component.props,
			functionalVNode = virtualCtx.render(virtualCtx, []);

		const filteredAttrs = Object.fromEntries(
			Object.entries({...vnode.props}).filter(([key]) => declaredProps[key.camelize(false)] == null)
		);

		vnode.type = functionalVNode.type;
		vnode.props = merge(filteredAttrs, functionalVNode.props ?? {});

		vnode.children = functionalVNode.children;
		vnode.dynamicChildren = functionalVNode.dynamicChildren;

		vnode.dirs = Array.concat([], vnode.dirs, functionalVNode.dirs);
		vnode.dirs.push({
			dir: Object.cast(r.resolveDirective.call(virtualCtx, 'hook')),

			modifiers: {},
			arg: undefined,

			value: {
				created: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'created', n),
				beforeMount: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeMount', n),
				mounted: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'mounted', n),
				beforeUpdate: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeUpdate', n),
				updated: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'updated', n),
				beforeUnmount: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'beforeDestroy', n),
				unmounted: (n: Element) => virtualCtx.$emit('[[COMPONENT_HOOK]]', 'destroyed', n)
			},

			oldValue: undefined,
			instance: Object.cast(virtualCtx)
		});

		if (vnode.shapeFlag < functionalVNode.shapeFlag) {
			// eslint-disable-next-line no-bitwise
			vnode.shapeFlag |= functionalVNode.shapeFlag;
		}

		if (vnode.patchFlag < functionalVNode.patchFlag) {
			// eslint-disable-next-line no-bitwise
			vnode.patchFlag |= functionalVNode.patchFlag;
		}

		functionalVNode.ignore = true;
		functionalVNode.props = {};
		functionalVNode.dirs = null;
		functionalVNode.children = [];
		functionalVNode.dynamicChildren = [];

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
	return Object.cast(function resolveComponent(this: ComponentInterface, name: string) {
		if (SSR) {
			name = name.replace(isSmartComponent, '');
		}

		const
			component = registerComponent(name);

		if (component?.params.functional === true) {
			return name;
		}

		if (isComponent.test(name) && app.context != null) {
			return app.context.component(name) ?? original(name);
		}

		return original(name);
	});
}

/**
 * Wrapper for the component library `resolveDirective` function
 * @param original
 */
export function wrapResolveDirective<T extends typeof resolveDirective>(
	original: T
): T {
	return Object.cast(function resolveDirective(this: ComponentInterface, name: string) {
		return app.context != null ? app.context.directive(name) ?? original(name) : original(name);
	});
}

/**
 * Wrapper for the component library `mergeProps` function
 * @param original
 */
export function wrapMergeProps<T extends typeof mergeProps>(original: T): T {
	return Object.cast(function mergeProps(this: ComponentInterface, ...args: Parameters<T>) {
		const
			props = original.apply(null, args);

		if (SSR) {
			return resolveAttrs.call(this, {props}).props;
		}

		return props;
	});
}

/**
 * Wrapper for the component library `renderList` function
 * @param original
 */
export function wrapRenderList<T extends typeof renderList, C extends typeof withCtx>(original: T, withCtx: C): T {
	return Object.cast(function renderList(
		this: ComponentInterface,
		src: Iterable<unknown> | Dictionary,
		cb: AnyFunction
	) {
		const
			// `v-for` is executed during rendering,
			// so `r.getCurrentInstance` should return `currentRenderingInstance`
			ctx = this.$renderEngine.r.getCurrentInstance(),
			// Preserve ctx for callback. It will guarantee
			// that during async render there will be correct `currentRenderingInstance`
			// which affects components' refs
			wrappedCb: AnyFunction = Object.cast(withCtx(cb, ctx));

		// Enable block tracking
		// @see https://github.com/vuejs/core/blob/45984d559fe0c036657d5f2626087ea8eec205a8/packages/runtime-core/src/componentRenderContext.ts#L88
		if ('_d' in wrappedCb) {
			wrappedCb._d = false;
		}

		this.$emit('[[V_FOR_CB]]', wrappedCb);
		return original(src, wrappedCb);
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

		return this.$withCtx(() => original.apply(null, args));
	});
}

/**
 * Wrapper for the component library `withCtx` function
 * @param original
 */
export function wrapWithCtx<T extends typeof withCtx>(original: T): T {
	return Object.cast(function withCtx(this: ComponentInterface, fn: Function) {
		return original((slotArgs: object) => fn(slotArgs, slotArgs));
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
		const that = this;
		patchVNode(vnode);

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

				virtualContext: vnode.virtualContext,
				virtualComponent: vnode.virtualComponent,

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
						patchVNode(vnode);
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

		function patchVNode(vnode: VNode) {
			if (that == null) {
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
					value: that
				});
			}
		}
	});
}

/**
 * Decorates the given component API and returns it
 *
 * @param path - the path from which the API was loaded
 * @param api
 */
export function wrapAPI<T extends Dictionary>(this: ComponentInterface, path: string, api: T): T {
	if (path === 'vue/server-renderer') {
		api = {...api};

		if (Object.isFunction(api.ssrRenderComponent)) {
			const {ssrRenderComponent} = api;

			Object.set(api, 'ssrRenderComponent', (
				component: {name: string},
				props: Nullable<Dictionary>,
				...args: unknown[]
			) => {
				const
					meta = registerComponent(component.name);

				if (meta != null) {
					props = normalizeComponentAttrs(props, [], meta);
				}

				return ssrRenderComponent(component, props, ...args);
			});
		}
	}

	return api;
}
