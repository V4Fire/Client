/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';
import watch, { WatchHandler, WatchHandlerParams } from 'core/object/watch';

import * as init from 'core/component/init';
import { beforeRenderHooks } from 'core/component/const';

import { fillMeta } from 'core/component/meta';
import { getComponentContext, dropRawComponentContext } from 'core/component/context';
import { wrapAPI } from 'core/component/render';

import type { ComponentEngine, ComponentOptions, SetupContext } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/interface';

import { supports, proxyGetters } from 'core/component/engines/vue3/const';

import * as r from 'core/component/engines/vue3/render';

/**
 * Returns a component declaration object from the specified metaobject
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<typeof ComponentEngine> {
	const {component} = fillMeta(meta);

	const p = meta.params;

	return {
		...Object.cast(component),
		inheritAttrs: p.inheritAttrs,

		data(): Dictionary {
			const {ctx, unsafe} = getComponentContext(this, true);

			unsafe.$vueWatch = this.$watch.bind(this);
			init.beforeDataCreateState(ctx);

			const emitter: Function = (_: unknown, handler: WatchHandler) => {
				// eslint-disable-next-line @v4fire/unbound-method
				const {unwatch} = watch(unsafe.$fields, {deep: true, immediate: true}, handler);
				return unwatch;
			};

			unsafe.$async.on(emitter, 'mutation', watcher, {
				group: 'watchers:suspend'
			});

			return SSR ? {} : unsafe.$fields;

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
					unsafe.$async.setImmediate(() => ctx.$forceUpdate(), {label: 'forceUpdate'});
				}
			}
		},

		setup(props: Dictionary, ctx: SetupContext) {
			return meta.methods.setup?.fn(props, ctx);
		},

		beforeCreate(): void {
			const {ctx, unsafe} = getComponentContext(this, true);

			// @ts-ignore (unsafe)
			ctx['$renderEngine'] = {supports, proxyGetters, r, wrapAPI};

			init.beforeCreateState(ctx, meta, {implementEventAPI: true})();

			if (SSR) {
				if (ctx.canFunctional !== true) {
					this._.type.serverPrefetch = () => {
						const init = unsafe.$initializer;

						try {
							// If init is a synchronous promise, we explicitly perform an `unwrap` to eliminate the extra microtask
							return SyncPromise.resolve(init).unwrap();

						} catch {
							return init;
						}
					};

				} else {
					delete this._.type.serverPrefetch;
				}
			}
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
			const ctx = getComponentContext(this);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (ctx == null) {
				return;
			}

			init.beforeDestroyState(ctx, {recursive: false});
		},

		unmounted(): void {
			const ctx = getComponentContext(this);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (ctx == null) {
				return;
			}

			init.destroyedState(ctx);
			dropRawComponentContext(ctx);
		},

		errorCaptured(...args: unknown[]): void {
			init.errorCapturedState(getComponentContext(this), ...args);
		},

		renderTriggered(...args: unknown[]): void {
			init.renderTriggeredState(getComponentContext(this), ...args);
		}
	};
}
