/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { WatchHandlerParams } from 'core/object/watch';

import * as init from 'core/component/init';
import { beforeRenderHooks } from 'core/component/const';

import { fillMeta } from 'core/component/meta';
import { getComponentContext } from 'core/component/context';

import type { ComponentEngine, ComponentOptions } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/interface';

import { supports, proxyGetters } from 'core/component/engines/vue3/const';

import * as r from 'core/component/engines/vue3/render';

/**
 * Returns a component declaration object from the specified meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<typeof ComponentEngine> {
	const
		{component} = fillMeta(meta);

	const
		p = meta.params;

	return {
		...Object.cast(component),
		inheritAttrs: p.inheritAttrs,

		data(): Dictionary {
			const
				ctx = getComponentContext(this);

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

				const
					firstPathProp = String(path[0]),
					shouldUpdate = meta.fields[firstPathProp]?.forceUpdate === true;

				if (shouldUpdate) {
					ctx.$forceUpdate();
				}
			}
		},

		beforeCreate(): void {
			const
				ctx = getComponentContext(this);

			Object.set(ctx, '$renderEngine', {
				r,
				supports,
				proxyGetters
			});

			init.beforeCreateState(ctx, meta, {implementEventAPI: true});
		},

		created(): void {
			init.createdState(getComponentContext(this));
		},

		beforeMount(): void {
			init.beforeMountState(getComponentContext(this));
		},

		mounted(): void {
			init.mountedState(getComponentContext(this));
		},

		beforeUpdate(): void {
			init.beforeUpdateState(getComponentContext(this));
		},

		updated(): void {
			init.updatedState(getComponentContext(this));
		},

		activated(): void {
			init.activatedState(getComponentContext(this));
		},

		deactivated(): void {
			init.deactivatedState(getComponentContext(this));
		},

		beforeUnmount(): void {
			init.beforeDestroyState(getComponentContext(this));
		},

		unmounted(): void {
			init.destroyedState(getComponentContext(this));
		},

		errorCaptured(...args: unknown[]): void {
			init.errorCapturedState(getComponentContext(this), ...args);
		},

		renderTracked(...args: unknown[]): void {
			init.renderTrackedState(getComponentContext(this), ...args);
		},

		renderTriggered(...args: unknown[]): void {
			init.errorCapturedState(getComponentContext(this), ...args);
		}
	};
}
