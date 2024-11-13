/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { isStore } from 'core/component/reflect';

import { createComponentDecorator3, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentField } from 'core/component/interface';
import type { ComponentMeta } from 'core/component/meta';

import type { PartDecorator } from 'core/component/decorators/interface';

import type {

	FieldCluster,
	InitFieldFn,

	DecoratorSystem,
	DecoratorField

} from 'core/component/decorators/system/interface';

const INIT = Symbol('The field initializer');

/**
 * Marks a class property as a system field.
 * Mutations to a system field never cause components to re-render.
 *
 * @decorator
 *
 * @param [initOrParams] - a function to initialize the field value or an object with field parameters
 * @param [initOrDefault] - a function to initialize the field value or the field default value
 * @param [cluster] - the cluster for the registered field: `systemFields` or `fields`
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
export function system(
	initOrParams?: InitFieldFn | DecoratorSystem,
	initOrDefault?: InitFieldFn | DecoratorSystem['default'],
	cluster?: 'systemFields'
): PartDecorator;

/**
 * Marks a class property as a field.
 *
 * @param [initOrParams] - a function to initialize the field value or an object with field parameters
 * @param [initOrDefault] - a function to initialize the field value or the field default value
 * @param [cluster] - the cluster for the registered field: `systemFields` or `fields`
 */
export function system(
	initOrParams: CanUndef<InitFieldFn | DecoratorField>,
	initOrDefault: InitFieldFn | DecoratorSystem['default'],
	cluster: 'fields'
): PartDecorator;

export function system(
	initOrParams?: InitFieldFn | DecoratorSystem | DecoratorField,
	initOrDefault?: InitFieldFn | DecoratorSystem['default'],
	cluster: FieldCluster = 'systemFields'
): PartDecorator {
	return createComponentDecorator3((desc, fieldName) => {
		const hasInitOrDefault =
			Object.isFunction(initOrParams) ||
			Object.isDictionary(initOrParams) && ('init' in initOrParams || 'default' in initOrParams);

		let params = initOrParams;

		if (initOrDefault !== undefined && !hasInitOrDefault) {
			if (Object.isFunction(initOrDefault)) {
				if (Object.isDictionary(params)) {
					params.init = initOrDefault;

				} else {
					params = initOrDefault;
				}

			} else if (Object.isDictionary(params)) {
				params.default = initOrDefault;

			} else {
				params = {default: initOrDefault};
			}
		}

		regField(fieldName, cluster, params, desc.meta);
	});
}

/**
 * Registers a component field in the specified metaobject
 *
 * @param fieldName - the name of the field
 * @param cluster - the cluster for the registered field: `systemFields` or `fields`
 * @param initOrParams - a function to initialize the field value or an object with field parameters
 * @param meta - the metaobject where the field is registered
 */
export function regField(
	fieldName: string,
	cluster: FieldCluster,
	initOrParams: Nullable<InitFieldFn | DecoratorField>,
	meta: ComponentMeta
): void {
	const params = Object.isFunction(initOrParams) ? {init: initOrParams} : {...initOrParams};

	let field: ComponentField;

	const
		store = meta[cluster],
		alreadyDefined = store.hasOwnProperty(fieldName);

	if (alreadyDefined) {
		field = store[fieldName]!;

	} else {
		if (meta.methods[fieldName] != null) {
			meta.methods[fieldName] = undefined;
		}

		const accessors = meta.accessors[fieldName] != null ?
			meta.accessors :
			meta.computedFields;

		if (accessors[fieldName] != null) {
			Object.defineProperty(meta.constructor.prototype, fieldName, defProp);
			accessors[fieldName] = undefined;
			delete meta.component.computed[fieldName];
		}

		// Handling the situation when a field changes type during inheritance,
		// for example, it was a @prop in the parent component and became a @system
		for (const anotherType of ['props', cluster === 'fields' ? 'systemFields' : 'fields']) {
			const anotherStore = meta[anotherType];

			if (anotherStore[fieldName] != null) {
				const field: ComponentField = {...anotherStore[fieldName]};

				// Do not inherit the `functional` option in this case
				delete field.functional;

				if (anotherType === 'props') {
					delete meta.component.props[fieldName];

					if (Object.isFunction(field.default)) {
						field.init = field.default;
						delete field.default;
					}
				}

				store[fieldName] = field;
				anotherStore[fieldName] = undefined;

				break;
			}
		}

		const parent = store[fieldName];

		if (parent != null) {
			field = {
				...parent,
				src: meta.componentName,
				meta: {...parent.meta}
			};

			if (parent.watchers != null) {
				field.watchers = new Map(parent.watchers);
			}

		} else {
			field = {
				src: meta.componentName,
				meta: {}
			};
		}
	}

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

	if (alreadyDefined) {
		const {meta} = field;

		if (params.meta != null) {
			Object.assign(meta, params.meta);
		}

		Object.assign(field, {
			...params,
			after,
			watchers,
			meta
		});

	} else {
		field = normalizeFunctionalParams({
			...field,
			...params,

			after,
			watchers,

			meta: {
				...field.meta,
				...params.meta
			}
		}, meta);

		store[fieldName] = field;

		if (isStore.test(fieldName)) {
			const tiedWith = isStore.replace(fieldName);
			meta.tiedFields[fieldName] = tiedWith;
			meta.tiedFields[tiedWith] = fieldName;
		}
	}

	if (field.init == null || !(INIT in field.init)) {
		const defValue = field.default;

		if (field.init != null) {
			const customInit = field.init;

			field.init = (ctx, store) => {
				const val = customInit.call(ctx, ctx, store);

				if (val === undefined && defValue !== undefined) {
					if (store[fieldName] === undefined) {
						return defValue;
					}

					return undefined;
				}

				return val;
			};

		} else if (defValue !== undefined) {
			field.init = (_, store) => {
				if (store[fieldName] === undefined) {
					return defValue;
				}

				return undefined;
			};
		}

		if (field.init != null) {
			Object.defineProperty(field.init, INIT, {value: true});
		}
	}

	if (watchers != null && watchers.size > 0) {
		meta.metaInitializers.set(fieldName, (meta) => {
			const isFunctional = meta.params.functional === true;

			for (const watcher of watchers!.values()) {
				if (isFunctional && watcher.functional === false) {
					continue;
				}

				const watcherListeners = meta.watchers[fieldName] ?? [];
				meta.watchers[fieldName] = watcherListeners;

				watcherListeners.push(watcher);
			}
		});
	}
}
