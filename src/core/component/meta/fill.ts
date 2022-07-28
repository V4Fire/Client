/* eslint-disable complexity */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DEFAULT_WRAPPER } from 'core/component/const';

import { getComponentContext } from 'core/component/context';
import { isAbstractComponent, bindingRgxp } from 'core/component/reflect';

import { isTypeCanBeFunc } from 'core/component/prop';
import { addMethodsToMeta } from 'core/component/meta/method';

import type { ComponentConstructor, ComponentMeta, ComponentField, WatchObject, Hook } from 'core/component/interface';

/**
 * Fills the passed meta object with methods and properties from the specified component class constructor
 *
 * @param meta
 * @param [constructor] - component constructor
 */
export function fillMeta(
	meta: ComponentMeta,
	constructor: ComponentConstructor = meta.constructor
): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	const {
		component,
		params,

		methods,
		accessors,
		computedFields,

		watchers,
		hooks,

		watchDependencies,
		watchPropDependencies
	} = meta;

	const instance = Object.cast<Dictionary>(new constructor());
	meta.instance = instance;

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	const
		isRoot = params.root === true,
		isFunctional = params.functional === true;

	// Props

	const
		defaultProps = params.defaultProps !== false;

	for (let o = meta.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			propName = keys[i],
			prop = o[propName];

		if (prop == null) {
			continue;
		}

		let
			def,
			defWrapper,
			skipDefault = true;

		if (defaultProps || prop.forceDefault) {
			skipDefault = false;
			def = instance[propName];
			defWrapper = def;

			if (def != null && typeof def === 'object' && (!isTypeCanBeFunc(prop.type) || !Object.isFunction(def))) {
				defWrapper = () => Object.fastClone(def);
				defWrapper[DEFAULT_WRAPPER] = true;
			}
		}

		let
			defValue;

		if (!skipDefault) {
			defValue = prop.default !== undefined ? prop.default : defWrapper;
		}

		if (!isRoot || defValue !== undefined) {
			component.props[propName] = {
				type: prop.type,
				required: prop.required !== false && defaultProps && defValue === undefined,

				default: defValue,
				functional: prop.functional,

				// eslint-disable-next-line @typescript-eslint/unbound-method
				validator: prop.validator
			};
		}

		if (!isRoot && !isFunctional) {
			if (Object.size(prop.watchers) > 0) {
				const watcherListeners = watchers[propName] ?? [];
				watchers[propName] = watcherListeners;

				prop.watchers.forEach((watcher) => {
					watcherListeners.push(watcher);
				});
			}

			const
				normalizedKey = propName.replace(bindingRgxp, '');

			if ((computedFields[normalizedKey] ?? accessors[normalizedKey]) != null) {
				const
					props = watchPropDependencies.get(normalizedKey) ?? new Set();

				props.add(propName);
				watchPropDependencies.set(normalizedKey, props);

			} else {
				watchDependencies.forEach((deps, key) => {
					for (let i = 0; i < deps.length; i++) {
						const
							dep = deps[i];

						if ((Object.isArray(dep) ? dep : dep.split('.'))[0] === propName) {
							const
								props = watchPropDependencies.get(key) ?? new Set();

							props.add(propName);
							watchPropDependencies.set(key, props);
							break;
						}
					}
				});
			}
		}
	}

	// Fields

	for (let fields = [meta.systemFields, meta.fields], i = 0; i < fields.length; i++) {
		for (let o = fields[i], keys = Object.keys(o), j = 0; j < keys.length; j++) {
			const
				key = keys[j],
				field = <NonNullable<ComponentField>>o[key];

			field.watchers?.forEach((watcher) => {
				if (isFunctional && watcher.functional === false) {
					return;
				}

				const
					watcherListeners = watchers[key] ?? [];

				watchers[key] = watcherListeners;
				watcherListeners.push(watcher);
			});
		}
	}

	// Computed fields

	for (let o = computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			nm = keys[i],
			computed = o[nm];

		if (computed == null || computed.cache !== 'auto') {
			continue;
		}

		component.computed[nm] = {
			get: computed.get,
			set: computed.set
		};
	}

	// Methods

	for (let o = methods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			nm = keys[i],
			method = o[nm];

		if (method == null) {
			continue;
		}

		component.methods[nm] = function wrapper() {
			// eslint-disable-next-line prefer-rest-params
			return method.fn.apply(getComponentContext(this), arguments);
		};

		if (method.watchers != null) {
			for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = <NonNullable<WatchObject>>o[key];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				const
					watcherListeners = watchers[key] ?? [];

				watchers[key] = watcherListeners;
				watcherListeners.push({
					...watcher,
					method: nm,
					args: Array.concat([], watcher.args),
					handler: Object.cast(method.fn)
				});
			}
		}

		// Method hooks

		if (method.hooks) {
			for (let o = method.hooks, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = <Hook>keys[i],
					hook = o[key];

				if (hook == null || isFunctional && hook.functional === false) {
					continue;
				}

				hooks[key].push({...hook, fn: method.fn});
			}
		}
	}

	// Modifiers

	const
		{mods} = component;

	for (let o = meta.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mod = o[key];

		let
			def;

		if (mod) {
			for (let i = 0; i < mod.length; i++) {
				const
					el = mod[i];

				if (Object.isArray(el)) {
					def = el;
					break;
				}
			}

			mods[key] = def !== undefined ? String(def[0]) : undefined;
		}
	}

	return meta;
}
