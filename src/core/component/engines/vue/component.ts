/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { set } from 'core/object/watch';
import * as init from 'core/component/construct';

import { beforeRenderHooks } from 'core/component/const';
import { fillMeta } from 'core/component/meta';
import { implementComponentForceUpdateAPI } from 'core/component/render';

import { supports, minimalCtx, proxyGetters } from 'core/component/engines/vue/const';
import { cloneVNode, patchVNode, renderVNode } from 'core/component/engines/vue/vnode';

import { fakeMapSetCopy } from 'core/component/engines/helpers';

import type { ComponentEngine, ComponentOptions } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/interface';

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
		...<any>(component),
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			event: m.event?.dasherize() ?? ''
		},

		data(): Dictionary {
			const
				ctx = <any>this,

				// eslint-disable-next-line @typescript-eslint/unbound-method
				{$watch, $set, $delete} = this;

			ctx.$vueWatch = $watch;
			ctx.$vueSet = $set;
			ctx.$vueDelete = $delete;

			init.beforeDataCreateState(ctx);

			watch(ctx.$fields, {deep: true, immediate: true}, (value, oldValue, info) => {
				ctx.lastSelfReasonToRender = {
					path: info.path,
					value,
					oldValue
				};

				if (beforeRenderHooks[ctx.hook] === true) {
					return;
				}

				if (meta.fields[String(info.path[0])]?.forceUpdate !== false) {
					ctx.$forceUpdate();
				}

				let
					{obj} = info;

				if (info.path.length > 1) {
					if (Object.isDictionary(obj)) {
						const
							key = String(info.path[info.path.length - 1]),
							desc = Object.getOwnPropertyDescriptor(obj, key);

						// If we register a new property, we must register it to Vue too
						if (!desc?.get) {
							// For correct registering of a property with Vue,
							// we need to remove it from a proxy and original object
							delete obj[key];

							// Get a link to a proxy object
							obj = Object.get(ctx.$fields, info.path.slice(0, -1)) ?? {};
							delete obj[key];

							// Finally we can register a Vue watcher
							$set.call(ctx, obj, key, value);

							// Don't forget to restore the original watcher
							set(obj, key, value);
						}

					// Because Vue doesn't see changes from Map/Set structures, we must use this hack
					} else if (Object.isSet(obj) || Object.isMap(obj) || Object.isWeakMap(obj) || Object.isWeakSet(obj)) {
						Object.set(ctx, info.path.slice(0, -1), fakeMapSetCopy(obj));
					}
				}
			});

			return ctx.$fields;
		},

		beforeCreate(): void {
			const
				ctx = <any>this;

			ctx.$renderEngine = {
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

		created(this: any): void {
			init.createdState(this);
		},

		beforeMount(this: any): void {
			init.beforeMountState(this);
		},

		mounted(this: any): void {
			init.mountedState(this);
		},

		beforeUpdate(this: any): void {
			init.beforeUpdateState(this);
		},

		updated(this: any): void {
			init.updatedState(this);
		},

		activated(this: any): void {
			init.activatedState(this);
		},

		deactivated(this: any): void {
			init.deactivatedState(this);
		},

		beforeDestroy(this: any): void {
			init.beforeDestroyState(this);
		},

		destroyed(this: any): void {
			init.destroyedState(this);
		},

		errorCaptured(this: any): void {
			init.errorCapturedState(this);
		}
	};
}
