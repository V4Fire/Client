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
			const ctx = <any>this;
			init.beforeDataCreateState(ctx);

			watch(ctx.$fields, {deep: true, collapse: true, immediate: true}, (val, oldVal, info) => {
				if (
					info.path.length > 1 &&
					(Object.isSet(val) || Object.isMap(val) || Object.isWeakMap(val) || Object.isWeakSet(val))
				) {
					Object.set(ctx, info.path.slice(0, -1), fakeMapSetCopy(val));
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
