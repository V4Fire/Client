/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$, mountHooks, parentMountMap } from 'core/component/create/functional/const';
import { runHook } from 'core/component/hook';
import { patchVNode as patch, VNode } from 'core/component/engines';

import { RenderContext } from 'core/component/render';
import { ComponentInterface } from 'core/component/interface';

/**
 * Patches the specified virtual node: adds classes, event handlers, etc.
 *
 * @param vnode
 * @param ctx - component context
 * @param renderCtx - render context
 */
export function patchVNode(vnode: VNode, ctx: ComponentInterface, renderCtx: RenderContext): VNode {
	// @ts-ignore (access)
	vnode.fakeContext = ctx;

	const
		{data} = renderCtx,
		// @ts-ignore (access)
		{meta: {methods}} = ctx;

	patch(vnode, ctx, renderCtx);

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

	runHook('created', ctx).then(() => {
		if (methods.created) {
			return methods.created.fn.call(ctx);
		}
	}, stderr);

	const
		p = ctx.$normalParent;

	if (!p) {
		return vnode;
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
	hooks.beforeDestroy.unshift({fn: destroy});

	const
		// @ts-ignore (access)
		{$async: $a} = ctx;

	const mount = (retry?) => {
		if (ctx.hook === 'mounted') {
			if (!ctx.keepAlive && !ctx.$el) {
				destroy();
			}

			return;
		}

		if (destroyed || ctx.hook !== 'created') {
			return;
		}

		if (!ctx.$el) {
			if (retry) {
				return;
			}

			// @ts-ignore (access)
			return $a.promise(p.$nextTick(), {
				label: $$.findElWait
			}).then(() => mount(true), stderr);
		}

		const
			el = ctx.$el;

		let
			oldCtx = el[$$.component];

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

			// @ts-ignore (access)
			oldCtx.$destroy();

			const
				props = ctx.$props,
				oldProps = oldCtx.$props,
				linkedFields = <Dictionary<string>>{};

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
							!ctx.$dataCache[key] &&
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

		el.component = el[$$.component] = ctx;

		runHook('mounted', ctx).then(() => {
			if (methods.mounted) {
				return methods.mounted.fn.call(ctx);
			}
		}, stderr);
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

	return vnode;
}
