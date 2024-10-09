/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { DEFAULT_WRAPPER } from 'core/component/const';

import { isBinding } from 'core/component/reflect';
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
	return createComponentDecorator(({meta}, propName) => {
		const params: DecoratorProp = Object.isFunction(typeOrParams) || Object.isArray(typeOrParams) ?
			{type: typeOrParams, forceUpdate: true} :
			{forceUpdate: true, ...typeOrParams};

		delete meta.methods[propName];

		const accessors = meta.accessors[propName] != null ?
			meta.accessors :
			meta.computedFields;

		if (accessors[propName] != null) {
			Object.defineProperty(meta.constructor.prototype, propName, defProp);
			delete accessors[propName];
		}

		// Handling the situation when a field changes type during inheritance,
		// for example, it was a @system in the parent component and became a @prop
		for (const anotherType of ['fields', 'systemFields']) {
			const cluster = meta[anotherType];

			if (propName in cluster) {
				const field: ComponentField = {...cluster[propName]};

				// Do not inherit the `functional` option in this case
				delete field.functional;

				// The option `init` cannot be converted to `default`
				delete field.init;

				meta.props[propName] = {...field, forceUpdate: true};

				delete cluster[propName];

				break;
			}
		}

		let prop: ComponentProp = meta.props[propName] ?? {
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

		prop = normalizeFunctionalParams({
			...prop,
			...params,

			watchers,

			meta: {
				...prop.meta,
				...params.meta
			}
		}, meta);

		meta.props[propName] = prop;

		let defaultValue: unknown;

		const
			isRoot = meta.params.root === true,
			isFunctional = meta.params.functional === true,
			defaultProps = meta.params.defaultProps !== false;

		if (defaultProps || prop.forceDefault) {
			if (prop.default !== undefined) {
				defaultValue = prop.default;

			} else {
				const defaultInstanceValue = meta.instance[propName];

				let getDefault = defaultInstanceValue;

				// If the default value of a prop is set via a default value for a class property,
				// it is necessary to clone this value for each new component instance
				// to ensure that they do not share the same value
				if (prop.type !== Function && defaultInstanceValue != null && typeof defaultInstanceValue === 'object') {
					getDefault = () => Object.isPrimitive(defaultInstanceValue) ?
						defaultInstanceValue :
						Object.fastClone(defaultInstanceValue);

					(<object>getDefault)[DEFAULT_WRAPPER] = true;
				}

				defaultValue = getDefault;
			}
		}

		if (!isRoot || defaultValue !== undefined) {
			const {component} = meta;

			(prop.forceUpdate ? component.props : component.attrs)[propName] = {
				type: prop.type,
				required: prop.required !== false && defaultProps && defaultValue === undefined,

				default: defaultValue,
				functional: prop.functional,

				// eslint-disable-next-line @v4fire/unbound-method
				validator: prop.validator
			};
		}

		const canWatchProps = !SSR && !isRoot && !isFunctional;

		if (canWatchProps || watchers != null && watchers.size > 0) {
			meta.metaInitializers.set(propName, (meta) => {
				const {watchPropDependencies} = meta;

				const
					isFunctional = meta.params.functional === true,
					canWatchProps = !SSR && !isRoot && !isFunctional;

				const watcherListeners = meta.watchers[propName] ?? [];
				meta.watchers[propName] = watcherListeners;

				if (watchers != null) {
					for (const watcher of watchers.values()) {
						if (isFunctional && watcher.functional === false || !canWatchProps && !watcher.immediate) {
							continue;
						}

						watcherListeners.push(watcher);
					}
				}

				if (canWatchProps) {
					const normalizedName = isBinding.test(propName) ? isBinding.replace(propName) : propName;

					if ((meta.computedFields[normalizedName] ?? meta.accessors[normalizedName]) != null) {
						const props = watchPropDependencies.get(normalizedName) ?? new Set();

						props.add(propName);
						watchPropDependencies.set(normalizedName, props);

					} else {
						for (const [path, deps] of meta.watchDependencies) {
							for (const dep of deps) {
								const pathChunks = Object.isArray(dep) ? dep : dep.split('.', 1);

								if (pathChunks[0] === propName) {
									const props = watchPropDependencies.get(path) ?? new Set();

									props.add(propName);
									watchPropDependencies.set(path, props);

									break;
								}
							}
						}
					}
				}
			});
		}
	});
}
