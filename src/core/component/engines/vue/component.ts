/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch from 'core/object/watch';
import * as init from 'core/component/construct';

import { beforeRenderHooks } from 'core/component/const';
import { fillMeta } from 'core/component/meta';

import { fakeMapSetCopy } from 'core/component/engines/helpers';
import { ComponentDriver, ComponentOptions } from 'core/component/engines';
import { ComponentMeta } from 'core/component/interface';

/**
 * Returns a component declaration object from the specified component meta object
 * @param meta
 */
export function getComponent(meta: ComponentMeta): ComponentOptions<ComponentDriver> {
	const
		p = meta.params,
		m = p.model;

	const
		{component} = fillMeta(meta);

	return {
		...<ComponentOptions<ComponentDriver>>Any(component),

		parent: p.parent,
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			event: m.event && m.event.dasherize() || ''
		},

		data(): Dictionary {
			const
				ctx = <any>this,
				{$set} = this;

			init.beforeDataCreateState(ctx);

			watch(ctx.$fields, {deep: true, immediate: true}, (val, oldVal, info) => {
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
							obj = Object.get(ctx.$fields, info.path.slice(0, -1));
							delete obj[key];

							// Finally we can register a Vue watcher
							$set.call(ctx, obj, key, val);
						}

					// Because Vue doesn't see changes from Map/Set structures, we must to use this hack
					} else if (Object.isSet(obj) || Object.isMap(obj) || Object.isWeakMap(obj) || Object.isWeakSet(obj)) {
						Object.set(ctx, info.path.slice(0, -1), fakeMapSetCopy(obj));
					}
				}
			});

			watch(ctx.$fields, {deep: true, collapse: true}, () => {
				if (!beforeRenderHooks[ctx.hook]) {
					ctx.$forceUpdate();
				}
			});

			return ctx.$fields;
		},

		beforeCreate(): void {
			init.beforeCreateState(<any>this, meta);
		},

		created(): void {
			init.createdState(<any>this);
		},

		beforeMount(): void {
			init.beforeMountState(<any>this);
		},

		mounted(): void {
			init.mountedState(<any>this);
		},

		beforeUpdate(): void {
			init.beforeUpdateState(<any>this);
		},

		updated(): void {
			init.updatedState(<any>this);
		},

		activated(): void {
			init.activatedState(<any>this);
		},

		deactivated(): void {
			init.deactivatedState(<any>this);
		},

		beforeDestroy(): void {
			init.beforeDestroyState(<any>this);
		},

		destroyed(): void {
			init.destroyedState(<any>this);
		},

		errorCaptured(): void {
			init.errorCapturedState(<any>this);
		}
	};
}
