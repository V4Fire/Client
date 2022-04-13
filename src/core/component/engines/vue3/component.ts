/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { WatchHandlerParams } from 'core/object/watch';
import * as init from 'core/component/construct';

import { beforeRenderHooks } from 'core/component/const';
import { fillMeta } from 'core/component/meta';
import { implementComponentForceUpdateAPI } from 'core/component/render';

import { supports, minimalCtx, proxyGetters } from 'core/component/engines/vue3/const';
import { cloneVNode, patchVNode, renderVNode } from 'core/component/engines/vue3/vnode';

import type { ComponentEngine, ComponentOptions } from 'core/component/engines';
import type { ComponentInterface, ComponentMeta } from 'core/component/interface';

/**
 * Returns a component declaration object from the specified component meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<typeof ComponentEngine> {
	const
		{component} = fillMeta(meta);

	const
		p = meta.params,
		ctxMap = new WeakMap();

	return {
		...Object.cast(component),
		inheritAttrs: p.inheritAttrs,

		data(): Dictionary {
			const
				ctx = getCtx(this);

			ctx.$vueWatch = this.$watch.bind(this);
			init.beforeDataCreateState(ctx);

			const emitter = (_, handler) => {
				// eslint-disable-next-line @typescript-eslint/unbound-method
				const {unwatch} = watch(ctx.$fields, {deep: true, immediate: true}, handler);
				return unwatch;
			};

			ctx.$async.on(emitter, 'mutation', watcher, {
				group: 'watchers:suspend'
			});

			return ctx.$fields;

			function watcher(value: unknown, oldValue: unknown, info: WatchHandlerParams): void {
				const
					{path} = info;

				if (beforeRenderHooks[ctx.hook] != null) {
					return;
				}

				ctx.lastSelfReasonToRender = {
					path,
					value,
					oldValue
				};

				const
					firstPathProp = String(path[0]),
					shouldUpdate = meta.fields[firstPathProp]?.forceUpdate !== false;

				if (shouldUpdate) {
					ctx.$forceUpdate();
				}
			}
		},

		beforeCreate(): void {
			const
				ctx = getCtx(this);

			Object.set(ctx, '$renderEngine', {
				supports,
				minimalCtx,
				proxyGetters,
				cloneVNode,
				patchVNode,
				renderVNode
			});

			init.beforeCreateState(ctx, meta, {implementEventAPI: true});
			implementComponentForceUpdateAPI(ctx, this.$forceUpdate.bind(this));
		},

		created(this: any): void {
			init.createdState(getCtx(this));
		},

		beforeMount(this: any): void {
			init.beforeMountState(getCtx(this));
		},

		mounted(): void {
			init.mountedState(getCtx(this));
		},

		beforeUpdate(): void {
			init.beforeUpdateState(getCtx(this));
		},

		updated(): void {
			init.updatedState(getCtx(this));
		},

		activated(): void {
			init.activatedState(getCtx(this));
		},

		deactivated(): void {
			init.deactivatedState(getCtx(this));
		},

		beforeUnmount(): void {
			init.beforeDestroyState(getCtx(this));
		},

		unmounted(): void {
			init.destroyedState(getCtx(this));
		},

		errorCaptured(): void {
			init.errorCapturedState(getCtx(this));
		}
	};

	function getCtx(ctx: object): Dictionary & ComponentInterface['unsafe'] {
		let
			v = ctxMap.get(ctx);

		if (v == null) {
			v = Object.create(ctx);
			ctxMap.set(ctx, v);
		}

		return v;
	}
}
