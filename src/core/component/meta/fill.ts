/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DEFAULT_WRAPPER } from 'core/component/const';

import { getComponentContext } from 'core/component/context';
import { isAbstractComponent, isBinding } from 'core/component/reflect';

import { isTypeCanBeFunc } from 'core/component/prop';
import { addMethodsToMeta } from 'core/component/meta/method';

import type { ComponentConstructor, ComponentMeta, ModVal } from 'core/component/interface';

const
	BLUEPRINT = Symbol('The meta blueprint'),
	INSTANCE = Symbol('The component instance'),
	ALREADY_PASSED = Symbol('This constructor is already passed');

/**
 * Populates the passed metaobject with methods and properties from the specified component class constructor
 *
 * @param meta
 * @param [constructor] - the component constructor
 */
export function fillMeta(meta: ComponentMeta, constructor: ComponentConstructor = meta.constructor): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	// For smart components, this method can be called more than once
	const isFirstFill = !constructor.hasOwnProperty(ALREADY_PASSED);

	if (Object.isDictionary(meta.params.functional) && meta[BLUEPRINT] == null) {
		Object.defineProperty(meta, BLUEPRINT, {
			value: {
				watchers: meta.watchers,
				hooks: meta.hooks
			}
		});
	}

	const blueprint: CanNull<Pick<ComponentMeta, 'watchers' | 'hooks'>> = meta[BLUEPRINT];

	if (blueprint != null) {
		const hooks = {};

		Object.entries(blueprint.hooks).forEach(([name, handlers]) => {
			hooks[name] = handlers.slice();
		});

		Object.assign(meta, {
			hooks,
			watchers: {...blueprint.watchers}
		});
	}

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

	Object.defineProperty(meta, 'instance', {
		enumerable: true,
		configurable: true,

		get() {
			if (!constructor.hasOwnProperty(INSTANCE)) {
				Object.defineProperty(constructor, INSTANCE, {value: new constructor()});
			}

			return constructor[INSTANCE];
		}
	});

	const
		isRoot = params.root === true,
		isFunctional = params.functional === true;

	// Props

	const
		defaultProps = params.defaultProps !== false,
		canWatchProps = !SSR && !isRoot && !isFunctional;

	Object.entries(meta.props).forEach(([propName, prop]) => {
		if (prop == null) {
			return;
		}

		if (isFirstFill) {
			let
				getDefault: unknown,
				skipDefault = true;

			if (defaultProps || prop.forceDefault) {
				const defaultInstanceValue = meta.instance[propName];

				skipDefault = false;
				getDefault = defaultInstanceValue;

				// If the default value of a field is set via default values for a class property,
				// it is necessary to clone this value for each new component instance
				// to ensure that they do not share the same value
				const needCloneDefValue =
					defaultInstanceValue != null && typeof defaultInstanceValue === 'object' &&
					(!isTypeCanBeFunc(prop.type) || !Object.isFunction(defaultInstanceValue));

				if (needCloneDefValue) {
					getDefault = () => Object.fastClone(defaultInstanceValue);
					(<object>getDefault)[DEFAULT_WRAPPER] = true;
				}
			}

			let defaultValue: unknown;

			if (!skipDefault) {
				defaultValue = prop.default !== undefined ? prop.default : getDefault;
			}

			if (!isRoot || defaultValue !== undefined) {
				(prop.forceUpdate ? component.props : component.attrs)[propName] = {
					type: prop.type,
					required: prop.required !== false && defaultProps && defaultValue === undefined,

					default: defaultValue,
					functional: prop.functional,

					// eslint-disable-next-line @v4fire/unbound-method
					validator: prop.validator
				};
			}
		}

		if (prop.watchers != null && Object.size(prop.watchers) > 0) {
			const watcherListeners = watchers[propName] ?? [];
			watchers[propName] = watcherListeners;

			prop.watchers.forEach((watcher) => {
				if (isFunctional && watcher.functional === false || !canWatchProps && !watcher.immediate) {
					return;
				}

				watcherListeners.push(watcher);
			});
		}

		if (canWatchProps) {
			const normalizedName = isBinding.test(propName) ? isBinding.replace(propName) : propName;

			if ((computedFields[normalizedName] ?? accessors[normalizedName]) != null) {
				const props = watchPropDependencies.get(normalizedName) ?? new Set();

				props.add(propName);
				watchPropDependencies.set(normalizedName, props);

			} else {
				watchDependencies.forEach((deps, path) => {
					deps.some((dep) => {
						const pathChunks = Object.isArray(dep) ? dep : dep.split('.', 1);

						if (pathChunks[0] === propName) {
							const props = watchPropDependencies.get(path) ?? new Set();

							props.add(propName);
							watchPropDependencies.set(path, props);

							return true;
						}

						return false;
					});
				});
			}
		}
	});

	// Fields

	[meta.systemFields, meta.fields].forEach((field) => {
		Object.entries(field).forEach(([fieldName, field]) => {
			field?.watchers?.forEach((watcher) => {
				if (isFunctional && watcher.functional === false) {
					return;
				}

				const watcherListeners = watchers[fieldName] ?? [];

				watchers[fieldName] = watcherListeners;
				watcherListeners.push(watcher);
			});
		});
	});

	// Computed fields

	if (isFirstFill) {
		Object.entries(computedFields).forEach(([name, computed]) => {
			if (computed == null || computed.cache !== 'auto') {
				return;
			}

			component.computed[name] = {
				get: computed.get,
				set: computed.set
			};
		});
	}

	// Methods

	Object.entries(methods).forEach(([methodName, method]) => {
		if (method == null) {
			return;
		}

		if (isFirstFill) {
			component.methods[methodName] = wrapper;

			if (wrapper.length !== method.fn.length) {
				Object.defineProperty(wrapper, 'length', {get: () => method.fn.length});
			}
		}

		if (method.watchers != null) {
			Object.entries(method.watchers).forEach(([watcherName, watcher]) => {
				if (watcher == null || isFunctional && watcher.functional === false) {
					return;
				}

				const watcherListeners = watchers[watcherName] ?? [];
				watchers[watcherName] = watcherListeners;

				watcherListeners.push({
					...watcher,
					method: methodName,
					args: Array.concat([], watcher.args),
					handler: Object.cast(method.fn)
				});
			});
		}

		// Method hooks

		if (method.hooks) {
			Object.entries(method.hooks).forEach(([hookName, hook]) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (hook == null || isFunctional && hook.functional === false) {
					return;
				}

				hooks[hookName].push({...hook, fn: method.fn});
			});
		}

		function wrapper(this: object) {
			// eslint-disable-next-line prefer-rest-params
			return method!.fn.apply(getComponentContext(this), arguments);
		}
	});

	// Modifiers

	if (isFirstFill) {
		const {mods} = component;

		Object.entries(meta.mods).forEach(([modsName, mod]) => {
			let defaultValue: CanUndef<ModVal[]>;

			if (mod != null) {
				mod.some((val) => {
					if (Object.isArray(val)) {
						defaultValue = val;
						return true;
					}

					return false;
				});

				mods[modsName] = defaultValue !== undefined ? String(defaultValue[0]) : undefined;
			}
		});
	}

	Object.defineProperty(constructor, ALREADY_PASSED, {value: true});

	return meta;
}
