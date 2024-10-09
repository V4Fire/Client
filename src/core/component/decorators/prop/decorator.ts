/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';

import { createComponentDecorator, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentProp, ComponentField } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';

import type { DecoratorProp, PropType } from 'core/component/decorators/prop/interface';

/**
 * Marks a class property as a component prop
 *
 * @decorator
 * @param [typeOrParams] - a constructor of the prop type or an object with prop parameters
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @prop(Number)
 *   bla: number = 0;
 *
 *   @prop({type: Number, required: false})
 *   baz?: number;
 *
 *   @prop({type: Number, default: () => Math.random()})
 *   bar!: number;
 * }
 * ```
 */
export function prop(typeOrParams?: PropType | DecoratorProp): PartDecorator {
	return createComponentDecorator(({meta}, key) => {
		const params: DecoratorProp = Object.isFunction(typeOrParams) || Object.isArray(typeOrParams) ?
			{type: typeOrParams, forceUpdate: true} :
			{forceUpdate: true, ...typeOrParams};

		delete meta.methods[key];
		delete meta.accessors[key];
		delete meta.computedFields[key];

		const accessors = meta.accessors[key] != null ?
			meta.accessors :
			meta.computedFields;

		if (accessors[key] != null) {
			Object.defineProperty(meta.constructor.prototype, key, defProp);
			delete accessors[key];
		}

		// Handling the situation when a field changes type during inheritance,
		// for example, it was a @system in the parent component and became a @prop
		for (const anotherType of ['fields', 'systemFields']) {
			const cluster = meta[anotherType];

			if (key in cluster) {
				const field: ComponentField = {...cluster[key]};

				// Do not inherit the `functional` option in this case
				delete field.functional;

				// The option `init` cannot be converted to `default`
				delete field.init;

				meta.props[key] = {...field, forceUpdate: true};

				delete cluster[key];

				break;
			}
		}

		const prop: ComponentProp = meta.props[key] ?? {
			forceUpdate: true,
			meta: {}
		};

		let {watchers} = prop;

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

		meta.props[key] = normalizeFunctionalParams({
			...prop,
			...params,

			watchers,

			meta: {
				...prop.meta,
				...params.meta
			}
		}, meta);
	});
}
