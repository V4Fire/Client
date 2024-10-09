/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { isStore } from 'core/component/reflect';

import { createComponentDecorator, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentField } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';

import type { InitFieldFn, DecoratorSystem, DecoratorField } from 'core/component/decorators/system/interface';

/**
 * Marks a class property as a system field.
 * Mutations to a system field never cause components to re-render.
 *
 * @decorator
 *
 * @param [initOrParams] - a function to initialize the field value or an object with field parameters
 * @param [type] - the type of the registered field: `systemFields` or `fields`
 *
 * @example
 * ```typescript
 * import iBlock, { component, system } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @system()
 *   bla: number = 0;
 *
 *   @system(() => Math.random())
 *   baz!: number;
 * }
 * ```
 */
export function system(initOrParams?: InitFieldFn | DecoratorSystem, type?: 'systemFields'): PartDecorator;

/**
 * Marks a class property as a field.
 *
 * @param [initOrParams] - a function to initialize the field value or an object with field parameters
 * @param [type] - the type of the registered field: `systemFields` or `fields`
 */
export function system(initOrParams: CanUndef<InitFieldFn | DecoratorField>, type: 'fields'): PartDecorator;

export function system(
	initOrParams?: InitFieldFn | DecoratorSystem | DecoratorField,
	type: 'fields' | 'systemFields' = 'systemFields'
): PartDecorator {
	return createComponentDecorator(({meta}, fieldName) => {
		const params = Object.isFunction(initOrParams) ? {init: initOrParams} : {...initOrParams};

		delete meta.methods[fieldName];

		const accessors = meta.accessors[fieldName] != null ?
			meta.accessors :
			meta.computedFields;

		if (accessors[fieldName] != null) {
			Object.defineProperty(meta.constructor.prototype, fieldName, defProp);
			delete accessors[fieldName];
		}

		// Handling the situation when a field changes type during inheritance,
		// for example, it was a @prop in the parent component and became a @system
		for (const anotherType of ['props', type === 'fields' ? 'systemFields' : 'fields']) {
			const cluster = meta[anotherType];

			if (fieldName in cluster) {
				const field: ComponentField = {...cluster[fieldName]};

				// Do not inherit the `functional` option in this case
				delete field.functional;

				if (anotherType === 'props') {
					delete meta.component.props[fieldName];

					if (Object.isFunction(field.default)) {
						field.init = field.default;
						delete field.default;
					}
				}

				meta[type][fieldName] = field;
				delete cluster[fieldName];

				break;
			}
		}

		const field: ComponentField = meta[type][fieldName] ?? {
			src: meta.componentName,
			meta: {}
		};

		let {watchers, after} = field;

		if (params.after != null) {
			after = new Set(Array.toArray(params.after));
		}

		if (params.watch != null) {
			watchers ??= new Map();

			for (const fieldWatcher of Array.toArray(params.watch)) {
				if (Object.isPlainObject(fieldWatcher)) {
					// FIXME: remove Object.cast
					watchers.set(fieldWatcher.handler, Object.cast(normalizeFunctionalParams({...fieldWatcher}, meta)));

				} else {
					// FIXME: remove Object.cast
					watchers.set(fieldWatcher, Object.cast(normalizeFunctionalParams({handler: fieldWatcher}, meta)));
				}
			}
		}

		meta[type][fieldName] = normalizeFunctionalParams({
			...field,
			...params,

			after,
			watchers,

			meta: {
				...field.meta,
				...params.meta
			}
		}, meta);

		if (isStore.test(fieldName)) {
			const tiedWith = isStore.replace(fieldName);
			meta.tiedFields[fieldName] = tiedWith;
			meta.tiedFields[tiedWith] = fieldName;
		}
	});
}
