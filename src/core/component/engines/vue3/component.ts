/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { WatchHandler, WatchHandlerParams } from 'core/object/watch';

import * as init from 'core/component/init';
import { beforeRenderHooks } from 'core/component/const';

import { fillMeta } from 'core/component/meta';
import { getComponentContext, dropRawComponentContext } from 'core/component/context';
import { wrapAPI } from 'core/component/render';

import type { ComponentEngine, ComponentOptions, SetupContext } from 'core/component/engines';
import type { ComponentInterface, ComponentMeta } from 'core/component/interface';

import { supports, proxyGetters } from 'core/component/engines/vue3/const';

import {

	getCurrentInstance,

	onBeforeMount,
	onMounted,

	onBeforeUpdate,
	onUpdated,

	onBeforeUnmount,
	onUnmounted,

	onErrorCaptured,
	onServerPrefetch,
	onRenderTriggered

} from 'vue';

import * as r from 'core/component/engines/vue3/render';

/**
 * Returns a component declaration object from the specified metaobject
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<typeof ComponentEngine> {
	const {component} = fillMeta(meta);

	const p = meta.params;

	return {
		name: component.name,
		props: component.props,

		methods: component.methods,
		computed: component.computed,
		render: component.render,

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
				const {path} = info;

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

		beforeCreate() {
			const ctx = getComponentContext(this);
			init.beforeCreateState(ctx, meta, {implementEventAPI: true});
		},

		setup(props: Dictionary, setupCtx: SetupContext) {
			const internalInstance = getCurrentInstance();

			let
				ctx: Nullable<ComponentInterface> = null,
				unsafe: Nullable<ComponentInterface['unsafe']> = null;

			({ctx, unsafe} = getComponentContext(internalInstance!['proxy']!, true));

			const {hooks} = meta;

			// @ts-ignore (unsafe)
			ctx['$renderEngine'] = {supports, proxyGetters, r, wrapAPI};

			if (SSR && ctx.canFunctional !== true) {
				onServerPrefetch(() => {
					if (unsafe == null) {
						return;
					}

					return unsafe.$initializer;
				});
			}

			onBeforeMount(() => {
				if (ctx == null) {
					return;
				}

				init.createdState(ctx);
				init.beforeMountState(ctx);
			});

			onMounted(() => {
				if (ctx == null) {
					return;
				}

				init.mountedState(ctx);
			});

			onBeforeUpdate(() => {
				if (ctx == null) {
					return;
				}

				init.beforeUpdateState(ctx);
			});

			onUpdated(() => {
				if (ctx == null) {
					return;
				}

				init.updatedState(ctx);
			});

			onBeforeUnmount(() => {
				if (ctx == null) {
					return;
				}

				init.beforeDestroyState(ctx, {recursive: true});
			});

			onUnmounted(() => {
				if (ctx == null) {
					return;
				}

				init.destroyedState(ctx);
				dropRawComponentContext(ctx);

				ctx = null;
				unsafe = null;
			});

			if (hooks.errorCaptured.length > 0) {
				onErrorCaptured((...args) => {
					if (ctx == null) {
						return;
					}

					init.errorCapturedState(ctx, ...args);
				});
			}

			if (hooks.renderTriggered.length > 0) {
				onRenderTriggered((...args) => {
					if (ctx == null) {
						return;
					}

					init.renderTriggeredState(ctx, ...args);
				});
			}

			return meta.methods.setup?.fn(props, setupCtx);
		}
	};
}
