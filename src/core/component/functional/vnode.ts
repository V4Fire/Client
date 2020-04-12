/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/construct';

import { patchVNode, VNode } from 'core/component/engines';
import { RenderContext } from 'core/component/render';
import { FlyweightVNode } from 'core/component/flyweight';

import { $$, mountHooks, parentMountMap } from 'core/component/functional/const';
import { ComponentInterface } from 'core/component/interface';

/**
 * Initializes a component from the specified VNode.
 * This function provides life-cycle hooks, adds classes and event listeners, etc.
 *
 * @param vnode
 * @param ctx - component context
 * @param renderCtx - render context
 */
export function initComponentVNode(vnode: VNode, ctx: ComponentInterface, renderCtx: RenderContext): FlyweightVNode {
	const flyweightVNode = <FlyweightVNode>vnode;
	flyweightVNode.fakeInstance = ctx;

	const {data} = renderCtx;
	patchVNode(flyweightVNode, ctx, renderCtx);

	// Attach component event listeners
	if (data.on) {
		for (let o = data.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				fns = (<Function[]>[]).concat(o[key]);

			for (let i = 0; i < fns.length; i++) {
				const
					fn = fns[i];

				if (Object.isFunction(fn)) {
					// @ts-ignore (access)
					ctx.$on(key, fn);
				}
			}
		}
	}

	init.createdState(ctx);

	const
		p = ctx.$normalParent;

	if (!p) {
		return flyweightVNode;
	}

	const
		// @ts-ignore (access)
		hooks = p.meta.hooks;

	let
		destroyed;

	const destroy = () => {
		// @ts-ignore (access)
		ctx.$destroy();
		destroyed = true;
	};

	destroy[$$.self] = ctx;

	// If a parent component was destroyed the current component need to destroy too
	hooks.beforeDestroy.unshift({fn: destroy});

	const
		// @ts-ignore (access)
		{$async: $a} = ctx;

	// Mount hook listener
	const mount = (retry?) => {
		if (ctx.hook === 'mounted') {
			// If a parent component was mounted, but the current component doesn't exist in the DOM and
			// doesn't have the keepAlive flag, then the component should to destroy
			if (!ctx.keepAlive && !ctx.$el) {
				destroy();
			}

			return;
		}

		if (destroyed || ctx.hook !== 'created') {
			return;
		}

		// If after the first mount hook the source component doesn't exists in the DOM,
		// we should try again on the next tick
		if (!ctx.$el) {
			if (retry) {
				return;
			}

			return $a.promise(p.$nextTick(), {
				label: $$.findElWait
			}).then(() => mount(true), stderr);
		}

		const
			el = ctx.$el;

		let
			oldCtx = el[$$.component];

		// The situation when we have an old context of the same component on the same node:
		// we need to merge the old state with a new
		if (oldCtx) {
			if (oldCtx === ctx) {
				return;
			}

			if (ctx.componentName !== oldCtx.componentName) {
				oldCtx = undefined;
				delete el[$$.component];
			}
		}

		if (oldCtx) {
			oldCtx._componentId = ctx.componentId;

			// Destroy the old component
			// @ts-ignore (access)
			oldCtx.$destroy();

			const
				props = ctx.$props,
				oldProps = oldCtx.$props,
				linkedFields = <Dictionary<string>>{};

			// Merge prop values
			for (let keys = Object.keys(oldProps), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					// @ts-ignore (access)
					linked = oldCtx.$syncLinkCache[key];

				if (linked) {
					for (let keys = Object.keys(linked), i = 0; i < keys.length; i++) {
						const
							link = linked[keys[i]];

						if (link) {
							linkedFields[link.path] = key;
						}
					}
				}
			}

			// Merge field values

			{
				const list = [
					// @ts-ignore (access)
					oldCtx.meta.systemFields,
					// @ts-ignore (access)
					oldCtx.meta.fields
				];

				for (let i = 0; i < list.length; i++) {
					const
						obj = list[i],
						keys = Object.keys(obj);

					for (let j = 0; j < keys.length; j++) {
						const
							key = keys[j],
							field = obj[key],
							link = linkedFields[key];

						if (!field) {
							continue;
						}

						const
							val = ctx[key],
							old = oldCtx[key];

						if (
							// @ts-ignore (access)
							!ctx.$modifiedFields[key] &&
							(Object.isFunction(field.unique) ? !field.unique(ctx, oldCtx) : !field.unique) &&
							!Object.fastCompare(val, old) &&

							(
								!link ||
								link && Object.fastCompare(props[link], oldProps[link])
							)
						) {
							if (field.merge) {
								if (field.merge === true) {
									let
										newVal = old;

									if (Object.isPlainObject(val) || Object.isPlainObject(old)) {
										// tslint:disable-next-line:prefer-object-spread
										newVal = Object.assign({}, val, old);

									} else if (Object.isArray(val) || Object.isArray(old)) {
										// tslint:disable-next-line:prefer-object-spread
										newVal = Object.assign([], val, old);
									}

									ctx[key] = newVal;

								} else {
									field.merge(ctx, oldCtx, key, link);
								}

							} else {
								ctx[key] = oldCtx[key];
							}
						}
					}
				}
			}
		}

		el[$$.component] = ctx;
		init.mountedState(ctx);
	};

	const deferMount = () => {
		if (ctx.$el) {
			ctx.$el.component = ctx;
		}

		$a.setImmediate(mount, {
			label: $$.mount,
			// @ts-ignore (access)
			onClear: () => ctx.$destroy()
		});

		const
			// @ts-ignore (access)
			{$destroyedHooks} = ctx;

		for (let o = (<string[]>[]).concat(mountHooks, parentHook || []), i = 0; i < o.length; i++) {
			const
				hook = o[i];

			if ($destroyedHooks[hook]) {
				continue;
			}

			const
				filteredHooks = <unknown[]>[];

			let
				hasChanges = false;

			for (let list = hooks[hook], j = 0; j < list.length; j++) {
				const
					el = list[j];

				if (el.fn[$$.self] !== ctx) {
					filteredHooks.push(el);

				} else {
					hasChanges = true;
				}
			}

			if (hasChanges) {
				hooks[hook] = filteredHooks;
			}

			$destroyedHooks[hook] = true;
		}
	};

	deferMount[$$.self] = ctx;

	const
		parentHook = parentMountMap[p.hook];

	for (let i = 0; i < mountHooks.length; i++) {
		const
			hook = mountHooks[i];

		if (hook === parentHook) {
			continue;
		}

		hooks[hook].unshift({
			fn: deferMount
		});
	}

	if (parentHook) {
		hooks[parentHook].unshift({
			fn: deferMount
		});

	} else {
		deferMount();
	}

	return flyweightVNode;
}
