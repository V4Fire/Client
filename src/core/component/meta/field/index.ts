/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { sortFields } from 'core/component/meta/field/sort';

import type { ComponentInterface } from 'core/component/interface';
import type { ComponentMeta } from 'core/component/meta/interface';

/**
 * Adds initialization functions to the metaobject for the given component field type, and also registers watchers
 *
 * @param type
 * @param meta
 */
export function addFieldsToMeta(type: 'fields' | 'systemFields', meta: ComponentMeta): void {
	const {watchers} = meta;

	const isFunctional = meta.params.functional === true;

	const
		fields = meta[type],
		fieldInitializers = type === 'fields' ? meta.fieldInitializers : meta.systemFieldInitializers;

	for (const fieldName of Object.keys(fields)) {
		const field = fields[fieldName];

		if (field == null || !SSR && isFunctional && field.functional === false) {
			continue;
		}

		let
			getValue: CanNull<AnyFunction> = null,
			getDefValue: CanNull<AnyFunction> = null;

		if (field.default !== undefined) {
			getDefValue = () => field.default;

		} else if (meta.instance[fieldName] !== undefined) {
			const val = meta.instance[fieldName];

			if (Object.isPrimitive(val)) {
				getDefValue = () => val;

			} else {
				// To prevent linking to the same type of component for non-primitive values,
				// it's important to clone the default value from the component constructor.
				getDefValue = () => Object.fastClone(val);
			}
		}

		if (field.init != null) {
			getValue = (ctx: ComponentInterface, store: Dictionary) => {
				const val = field.init!(ctx.unsafe, store);

				if (val === undefined && getDefValue != null) {
					if (store[fieldName] === undefined) {
						store[fieldName] = getDefValue();
					}

				} else {
					store[fieldName] = val;
				}
			};

		} else if (getDefValue != null) {
			getValue = (_: ComponentInterface, store: Dictionary) => {
				if (store[fieldName] === undefined) {
					store[fieldName] = getDefValue!();
				}
			};
		}

		fieldInitializers.push([fieldName, getValue]);

		if (field.watchers != null) {
			for (const watcher of field.watchers.values()) {
				if (isFunctional && watcher.functional === false) {
					continue;
				}

				const watcherListeners = watchers[fieldName] ?? [];
				watchers[fieldName] = watcherListeners;

				watcherListeners.push(watcher);
			}
		}
	}

	sortFields(fieldInitializers, fields);
}
