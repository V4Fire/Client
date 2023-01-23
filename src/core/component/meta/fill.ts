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

import type { ComponentConstructor, ComponentMeta } from 'core/component/interface';

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
		defaultProps = params.defaultProps !== false,
		canWatchProps = !isRoot && !isFunctional;

	Object.entries(meta.props).forEach(([name, prop]) => {
		if (prop == null) {
			return;
		}

		let
			def,
			defWrapper,
			skipDefault = true;

		if (defaultProps || prop.forceDefault) {
			skipDefault = false;
			def = instance[name];
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
			component.props[name] = {
				type: prop.type,
				required: prop.required !== false && defaultProps && defValue === undefined,

				default: defValue,
				functional: prop.functional,

				// eslint-disable-next-line @typescript-eslint/unbound-method
				validator: prop.validator
			};
		}

		if (Object.size(prop.watchers) > 0) {
			const watcherListeners = watchers[name] ?? [];
			watchers[name] = watcherListeners;

			prop.watchers.forEach((watcher) => {
				if (
					isFunctional && watcher.functional === false ||
					!canWatchProps && !watcher.immediate
				) {
					return;
				}

				watcherListeners.push(watcher);
			});
		}

		if (canWatchProps) {
			const
				normalizedKey = name.replace(bindingRgxp, '');

			if ((computedFields[normalizedKey] ?? accessors[normalizedKey]) != null) {
				const
					props = watchPropDependencies.get(normalizedKey) ?? new Set();

				props.add(name);
				watchPropDependencies.set(normalizedKey, props);

			} else {
				watchDependencies.forEach((deps, path) => {
					for (let i = 0; i < deps.length; i++) {
						const
							dep = deps[i];

						if ((Object.isArray(dep) ? dep : dep.split('.'))[0] === name) {
							const
								props = watchPropDependencies.get(path) ?? new Set();

							props.add(name);
							watchPropDependencies.set(path, props);
							break;
						}
					}
				});
			}
		}
	});

	// Fields

	[meta.systemFields, meta.fields].forEach((field) => {
		Object.entries(field).forEach(([key, field]) => {
			field?.watchers?.forEach((watcher) => {
				if (isFunctional && watcher.functional === false) {
					return;
				}

				const
					watcherListeners = watchers[key] ?? [];

				watchers[key] = watcherListeners;
				watcherListeners.push(watcher);
			});
		});
	});

	// Computed fields

	Object.entries(computedFields).forEach(([name, computed]) => {
		if (computed == null || computed.cache !== 'auto') {
			return;
		}

		component.computed[name] = {
			get: computed.get,
			set: computed.set
		};
	});

	// Methods

	Object.entries(methods).forEach(([name, method]) => {
		if (method == null) {
			return;
		}

		component.methods[name] = wrapper;
		Object.defineProperty(wrapper, 'length', {get: () => method.fn.length});

		function wrapper(this: object) {
			// eslint-disable-next-line prefer-rest-params
			return method!.fn.apply(getComponentContext(this), arguments);
		}

		if (method.watchers != null) {
			Object.entries(method.watchers).forEach(([key, watcher]) => {
				if (watcher == null || isFunctional && watcher.functional === false) {
					return;
				}

				const watcherListeners = watchers[key] ?? [];
				watchers[key] = watcherListeners;

				watcherListeners.push({
					...watcher,
					method: name,
					args: Array.concat([], watcher.args),
					handler: Object.cast(method.fn)
				});
			});
		}

		// Method hooks

		if (method.hooks) {
			Object.entries(method.hooks).forEach(([key, hook]) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (hook == null || isFunctional && hook.functional === false) {
					return;
				}

				hooks[key].push({...hook, fn: method.fn});
			});
		}
	});

	// Modifiers

	const
		{mods} = component;

	Object.entries(meta.mods).forEach(([key, mod]) => {
		let
			def;

		if (mod != null) {
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
	});

	return meta;
}
