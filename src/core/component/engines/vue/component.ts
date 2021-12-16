/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { set, mute, unmute, WatchHandlerParams } from 'core/object/watch';
import * as init from 'core/component/construct';

import { beforeRenderHooks } from 'core/component/const';
import { fillMeta } from 'core/component/meta';
import { implementComponentForceUpdateAPI } from 'core/component/render';

import { supports, minimalCtx, proxyGetters } from 'core/component/engines/vue/const';
import { cloneVNode, patchVNode, renderVNode } from 'core/component/engines/vue/vnode';

import { fakeMapSetCopy } from 'core/component/engines/helpers';

import type { ComponentEngine, ComponentOptions } from 'core/component/engines';
import type { ComponentInterface, UnsafeComponentInterface, ComponentMeta } from 'core/component/interface';

/**
 * Returns a component declaration object from the specified component meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<ComponentEngine> {
	const
		{component} = fillMeta(meta);

	const
		p = meta.params,
		m = p.model;

	return {
		...Object.cast(component),
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			event: m.event?.dasherize() ?? ''
		},

		data(this: ComponentInterface): Dictionary {
			const
				ctx = Object.cast<UnsafeComponentInterface>(this),

				// eslint-disable-next-line @typescript-eslint/unbound-method
				{$watch, $set, $delete} = this;

			this['$vueWatch'] = $watch;
			this['$vueSet'] = $set;
			this['$vueDelete'] = $delete;

			init.beforeDataCreateState(this);

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

				ctx.lastSelfReasonToRender = {
					path,
					value,
					oldValue
				};

				if (beforeRenderHooks[ctx.hook] === true) {
					return;
				}

				if (meta.fields[String(path[0])]?.forceUpdate !== false) {
					ctx.$forceUpdate();
				}

				let
					{obj} = info;

				if (path.length > 1) {
					if (Object.isDictionary(obj)) {
						const
							key = String(path[path.length - 1]),
							desc = Object.getOwnPropertyDescriptor(obj, key);

						// If we register a new property, we must register it to Vue too
						if (desc?.get == null) {
							// For correct registering of a property with Vue,
							// we need to remove it from a proxy and original object
							delete obj[key];

							// Get a link to a proxy object
							obj = Object.get(ctx.$fields, path.slice(0, -1)) ?? {};
							delete obj[key];

							// Finally, we can register a Vue watcher
							$set.call(ctx, obj, key, value);

							// Don't forget to restore the original watcher
							mute(obj);
							set(obj, key, value);
							unmute(obj);
						}

					// Because Vue does not see changes from Map/Set structures, we must use this hack
					} else if (Object.isSet(obj) || Object.isMap(obj) || Object.isWeakMap(obj) || Object.isWeakSet(obj)) {
						Object.set(ctx, path.slice(0, -1), fakeMapSetCopy(obj));
					}
				}
			}
		},

		beforeCreate(): void {
			const
				ctx = Object.cast<ComponentInterface>(this),
				unsafe = Object.cast<UnsafeComponentInterface>(this);

			unsafe.$renderEngine = {
				supports,
				minimalCtx,
				proxyGetters,
				cloneVNode,
				patchVNode,
				renderVNode
			};

			init.beforeCreateState(ctx, meta);
			implementComponentForceUpdateAPI(ctx, this.$forceUpdate.bind(this));
		},

		created(this: ComponentInterface): void {
			init.createdState(this);
		},

		beforeMount(this: ComponentInterface): void {
			init.beforeMountState(this);
		},

		mounted(this: ComponentInterface): void {
			init.mountedState(this);
		},

		beforeUpdate(this: ComponentInterface): void {
			init.beforeUpdateState(this);
		},

		updated(this: ComponentInterface): void {
			init.updatedState(this);
		},

		activated(this: ComponentInterface): void {
			init.activatedState(this);
		},

		deactivated(this: ComponentInterface): void {
			init.deactivatedState(this);
		},

		beforeDestroy(this: ComponentInterface): void {
			init.beforeDestroyState(this);
		},

		destroyed(this: ComponentInterface): void {
			init.destroyedState(this);
		},

		errorCaptured(this: ComponentInterface): void {
			init.errorCapturedState(this);
		}
	};
}
