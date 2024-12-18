/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable prefer-spread */

import { wrapWithMeasurement } from 'core/performance';

import { app, isComponent, componentRenderFactories, ASYNC_RENDER_ID, components } from 'core/component/const';
import { attachTemplatesToMeta, ComponentMeta } from 'core/component/meta';

import { isSmartComponent } from 'core/component/reflect';
import { createVirtualContext, VHookLifeCycle } from 'core/component/functional';

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

	withModifiers,

	VNode,
	DirectiveArguments,
	DirectiveBinding

} from 'core/component/engines';

import type { ssrRenderSlot as ISSRRenderSlot } from '@vue/server-renderer';

import { getComponentMeta, registerComponent } from 'core/component/init';

import {

	isHandler,

	resolveAttrs,
	normalizeComponentAttrs,

	normalizePatchFlagUsingProps,
	setVNodePatchFlags,

	mergeProps as merge

} from 'core/component/render/helpers';

import type { ComponentInterface } from 'core/component/interface';

/**
 * A wrapper for the component library `createVNode` function
 * @param original
 */
export function wrapCreateVNode<T extends typeof createVNode>(original: T): T {
	return wrapCreateBlock(original);
}

/**
 * A wrapper for the component library `createElementVNode` function
 * @param original
 */
export function wrapCreateElementVNode<T extends typeof createElementVNode>(original: T): T {
	return Object.cast(function createElementVNode(this: ComponentInterface, ...args: Parameters<T>) {
		args[3] = normalizePatchFlagUsingProps.call(this, args[3], args[1]);
		return resolveAttrs.call(this, original.apply(null, args));
	});
}

/**
 * A wrapper for the component library `createBlock` function
 * @param original
 */
export function wrapCreateBlock<T extends typeof createBlock>(original: T): T {
	function getMeasurementName(this: ComponentInterface, ...args: Parameters<T>): CanNull<string> {
		let 
			[name] = args,
			component: CanNull<ComponentMeta> = null;

		if (Object.isString(name)) {
			component = getComponentMeta(name);

		} else if (!Object.isPrimitive(name) && 'name' in name && name.name != null) {
			component = getComponentMeta(name.name);
		}

		if (component == null) {
			return null;
		}

		return `<${component.componentName.camelize(true)}> create block`;
	}

	function innerCreateBlock(this: ComponentInterface, ...args: Parameters<T>) {
		let [name, attrs, slots, patchFlag, dynamicProps] = args;

		let component: CanNull<ComponentMeta> = null;

		patchFlag = normalizePatchFlagUsingProps.call(this, patchFlag, attrs);

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
			vnode = createVNode(name, attrs, isRegular ? slots : null, patchFlag, dynamicProps);

		let props = vnode.props ?? {};
		vnode.props = props;

		// By default, mods are passed down from the parent (see `sharedMods`), but if there is actually nothing there,
		// we remove them from the vnode to avoid registering empty handlers and watchers
		if ('modsProp' in props && props.modsProp == null) {
			delete vnode.props.modsProp;
			delete vnode.props['on:modsProp'];
		}

		props.getRoot ??= this.$getRoot(this);

		props.getParent ??= () => vnode.virtualParent?.value != null ?
			vnode.virtualParent.value :
			this;

		let passedProps: Nullable<Dictionary> = null;
		props.getPassedProps ??= () => passedProps ??= attrs;

		// For refs within functional components,
		// it is necessary to explicitly set a reference to the instance of the component
		if (!SSR && vnode.ref != null && vnode.ref.i == null) {
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

		const virtualCtx = createVirtualContext(component, {parent: this, props: attrs, slots});
		vnode.virtualComponent = virtualCtx;

		const filteredAttrs = {};

		const
			declaredProps = component.props,
			propKeys = Object.keys(props);

		for (let i = 0; i < propKeys.length; i++) {
			const propName = propKeys[i];

			if (declaredProps[propName.camelize(false)] == null) {
				filteredAttrs[propName] = props[propName];
			}
		}

		const functionalVNode = virtualCtx.render(virtualCtx, []);

		vnode.type = functionalVNode.type;

		props = merge(filteredAttrs, functionalVNode.props ?? {});
		vnode.props = props;

		vnode.children = functionalVNode.children;
		vnode.dynamicChildren = functionalVNode.dynamicChildren;

		vnode.dirs = Array.toArray(vnode.dirs, functionalVNode.dirs);

		vnode.dirs.push({
			dir: r.resolveDirective.call(virtualCtx, 'hook'),

			modifiers: {},
			arg: undefined,

			value: new VHookLifeCycle(virtualCtx),
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

		if (!SSR && functionalVNode.dynamicProps != null && functionalVNode.dynamicProps.length > 0) {
			const functionalProps = functionalVNode.dynamicProps;

			const dynamicProps = vnode.dynamicProps ?? [];
			vnode.dynamicProps = dynamicProps;

			for (let i = 0; i < functionalProps.length; i++) {
				const propName = functionalProps[i];

				if (isHandler.test(propName)) {
					dynamicProps.push(propName);
					setVNodePatchFlags(vnode, 'props');
				}
			}
		}

		functionalVNode.ignore = true;
		functionalVNode.props = {};
		functionalVNode.dirs = null;
		functionalVNode.children = [];
		functionalVNode.dynamicChildren = [];

		return vnode;
	}

	return Object.cast(
		wrapWithMeasurement(
			getMeasurementName,
			innerCreateBlock
		)
	)
}

/**
 * A wrapper for the component library `createElementBlock` function
 * @param original
 */
export function wrapCreateElementBlock<T extends typeof createElementBlock>(original: T): T {
	return Object.cast(
		wrapWithMeasurement(
			function getMeasurementName(this: ComponentInterface) {
				return `<${this.componentName.camelize(true)}> create element block`;
			},

			function createElementBlock(this: ComponentInterface, ...args: Parameters<T>) {
				args[3] = normalizePatchFlagUsingProps.call(this, args[3], args[1]);
				return resolveAttrs.call(this, original.apply(null, args));
			}
		)
	);
}

/**
 * A wrapper for the component library `resolveComponent` or `resolveDynamicComponent` functions
 * @param original
 */
export function wrapResolveComponent<T extends typeof resolveComponent | typeof resolveDynamicComponent>(
	original: T
): T {
	return Object.cast(function resolveComponent(this: ComponentInterface, name: string) {
		if (SSR) {
			name = isSmartComponent.test(name) ? isSmartComponent.replace(name) : name;
		}

		const component = registerComponent(name);

		if (component?.params.functional === true) {
			return name;
		}

		const {context: appCtx} = SSR ? this.app : app;

		if (isComponent.test(name) && appCtx != null) {
			return appCtx.component(name) ?? original(name);
		}

		return original(name);
	});
}

/**
 * A wrapper for the component library `resolveDirective` function
 * @param original
 */
export function wrapResolveDirective<T extends typeof resolveDirective>(
	original: T
): T {
	return Object.cast(function resolveDirective(this: ComponentInterface, name: string) {
		const {context: appCtx} = SSR ? this.app : app;
		return appCtx != null ? appCtx.directive(name) ?? original(name) : original(name);
	});
}

/**
 * A wrapper for the component library `mergeProps` function
 * @param original
 */
export function wrapMergeProps<T extends typeof mergeProps>(original: T): T {
	return Object.cast(function mergeProps(this: ComponentInterface, ...args: Parameters<T>) {
		const props = original.apply(null, args);

		if (SSR) {
			return resolveAttrs.call(this, {props}).props;
		}

		return props;
	});
}

/**
 * A wrapper for the component library `renderList` function
 *
 * @param original
 */
export function wrapRenderList<T extends typeof renderList>(original: T): T {
	return Object.cast(
		wrapWithMeasurement(
			function getMeasurementName(this: ComponentInterface, ..._args: unknown[]) {
				return `<${this.componentName.camelize(true)}> render list`;
			},

			function renderList(
				this: ComponentInterface,
				src: Nullable<Iterable<unknown> | Dictionary | number>,
				cb: AnyFunction
			) {
				const 
					wrappedCb: AnyFunction = Object.cast(cb),
					vnodes = original(src, wrappedCb),
					asyncRenderId = src?.[ASYNC_RENDER_ID];

				if (asyncRenderId != null) {
					this.$emit('[[V_FOR_CB]]', {wrappedCb});

					Object.defineProperty(vnodes, ASYNC_RENDER_ID, {
						writable: false,
						enumerable: false,
						configurable: false,
						value: asyncRenderId
					});
				}

				return vnodes;
			}
		)
	);
}

/**
 * A wrapper for the component library `renderSlot` function
 * @param original
 */
export function wrapRenderSlot<T extends typeof renderSlot>(original: T): T {
	return Object.cast(function renderSlot(this: ComponentInterface, ...args: Parameters<T>) {
		const {r} = this.$renderEngine;

		if (this.meta.params.functional === true) {
			try {
				return original.apply(null, args);

			} catch {
				const [slots, name, props, fallback] = args;
				const children = slots[name]?.(props) ?? fallback?.() ?? [];
				return r.createBlock.call(this, r.Fragment, {key: props?.key ?? `_${name}`}, children);
			}
		}

		return this.$withCtx(() => original.apply(null, args));
	});
}

/**
 * A wrapper for the component library `withCtx` function
 * @param original
 */
export function wrapWithCtx<T extends typeof withCtx>(original: T): T {
	return Object.cast(function withCtx(this: ComponentInterface, fn: Function) {
		return original((...args: unknown[]) => {
			// The number of arguments for this function varies depending on the compilation mode: either SSR or browser.
			// This condition helps optimize performance in the browser.
			if (args.length === 1) {
				return fn(args[0], args[0]);
			}

			// If the original function expects more arguments than provided, we explicitly set them to `undefined`,
			// to then add another, "unregistered" argument
			if (fn.length - args.length > 0) {
				args.push(...new Array(fn.length - args.length).fill(undefined));
			}

			args.push(args[0]);
			return fn(...args);
		});
	});
}

/**
 * A wrapper for the component library `withDirectives` function
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

		for (let i = 0; i < dirs.length; i++) {
			const decl = dirs[i];

			const [dir, value, arg, modifiers] = decl;

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

			if (!Object.isDictionary(dir)) {
				bindings.push(binding);
				continue;
			}

			if (Object.isFunction(dir.beforeCreate)) {
				const newVnode = dir.beforeCreate(binding, vnode);

				if (newVnode != null) {
					vnode = newVnode;
					patchVNode(vnode);
				}

				if (Object.keys(dir).length > 1) {
					bindings.push(binding);
				}

			} else if (Object.keys(dir).length > 0) {
				bindings.push(binding);
			}
		}

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
	type BufItems = Array<Parameters<Parameters<typeof ISSRRenderSlot>[4]>[0]>;

	if (path === 'vue/server-renderer') {
		api = {...api};

		if (Object.isFunction(api.ssrRenderComponent)) {
			const {ssrRenderComponent} = api;

			// @ts-ignore (unsafe)
			api['ssrRenderComponent'] = (
				component: {name: string},
				props: Nullable<Dictionary>,
				...args: unknown[]
			) => {
				const
					meta = registerComponent(component.name);

				if (meta != null) {
					props = normalizeComponentAttrs(props, [], meta);
					props = resolveAttrs.call(this, {props}).props;
				}

				return ssrRenderComponent(component, props, ...args);
			};
		}

		if (Object.isFunction(api.ssrRenderSlot)) {
			const {ssrRenderSlot} = api;

			// @ts-ignore (unsafe)
			api['ssrRenderSlot'] = (...args: Parameters<typeof ISSRRenderSlot>) => {
				const
					slotName = args[1],
					cacheKey = `${this.globalName}-${slotName}`,
					push = args[args.length - 2];

				const canCache =
					'$ssrCache' in this && this.$ssrCache != null && !this.$ssrCache.has(cacheKey) &&
					'globalName' in this && this.globalName != null &&
					Object.isFunction(push);

				if (canCache) {
					// A special buffer for caching the result during SSR.
					// This is necessary to reduce substring concatenations during SSR and speed up the output.
					// It is used in the bCacheSSR component.
					const cacheBuffer: BufItems = [];

					args[args.length - 2] = (str) => {
						cacheBuffer.push(str);
						push(str);
					};

					const res = ssrRenderSlot(...args);

					unrollBuffer(cacheBuffer)
						.then((res) => this.$ssrCache!.set(cacheKey, res))
						.catch(stderr);

					return res;
				}

				return ssrRenderSlot(...args);
			};
		}
	}

	return api;

	async function unrollBuffer(buf: BufItems): Promise<string> {
		let res = '';

		for (let i = 0; i < buf.length; i++) {
			let val = buf[i];

			if (Object.isPromise(val)) {
				val = await val;
			}

			if (Object.isString(val)) {
				res += val;
				continue;
			}

			res += await unrollBuffer(val);
		}

		return res;
	}
}

/**
 * A wrapper for the component library `withModifiers` function
 * @param original
 */
export function wrapWithModifiers<T extends typeof withModifiers>(original: T): T {
	return Object.cast(function withModifiers(fn: Function, modifiers: string[]) {
		return (event: Event, ...args: unknown[]) => {
			if (modifiers.includes('safe') && event.target instanceof Element && !event.target.isConnected) {
				event.stopImmediatePropagation();
				return;
			}

			return original(fn, modifiers)(event, ...args);
		};
	});
}
