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
	ALREADY_PASSED = Symbol('This target is passed'),
	BLUEPRINT = Symbol('This is a meta blueprint'),
	INSTANCE = Symbol('The component instance');

/**
 * Populates the passed metaobject with methods and properties from the specified component class constructor
 *
 * @param meta
 * @param [constructor] - the component constructor
 */
export function fillMeta(
	meta: ComponentMeta,
	constructor: ComponentConstructor = meta.constructor
): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	// For smart components, this method can be called more than once
	const isFirstFill = !constructor.hasOwnProperty(ALREADY_PASSED);

	if (meta[BLUEPRINT] == null) {
		Object.defineProperty(meta, BLUEPRINT, {
			value: {
				watchers: meta.watchers,
				hooks: meta.hooks
			}
		});
	}

	const blueprint: Pick<
		ComponentMeta,
		'watchers' | 'hooks'
	> = meta[BLUEPRINT];

	Object.assign(meta, {
		watchers: {...blueprint.watchers},
		hooks: Object.fromEntries(
			Object.entries(blueprint.hooks).map(([key, val]) => [key, val.slice()])
		)
	});

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

	Object.entries(meta.props).forEach(([name, prop]) => {
		if (prop == null) {
			return;
		}

		if (isFirstFill) {
			let
				getDefault: unknown,
				skipDefault = true;

			if (defaultProps || prop.forceDefault) {
				const defaultInstanceValue = meta.instance[name];

				skipDefault = false;
				getDefault = defaultInstanceValue;

				// If the default value of a field is set through default values for a class property,
				// then we need to clone it for each new component instance to ensure that they do not use a shared value
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
				(prop.forceUpdate ? component.props : component.attrs)[name] = {
					type: prop.type,
					required: prop.required !== false && defaultProps && defaultValue === undefined,

					default: defaultValue,
					functional: prop.functional,

					// eslint-disable-next-line @v4fire/unbound-method
					validator: prop.validator
				};
			}
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
			const normalizedName = isBinding.test(name) ? isBinding.replace(name) : name;

			if ((computedFields[normalizedName] ?? accessors[normalizedName]) != null) {
				const props = watchPropDependencies.get(normalizedName) ?? new Set();

				props.add(name);
				watchPropDependencies.set(normalizedName, props);

			} else {
				watchDependencies.forEach((deps, path) => {
					deps.some((dep) => {
						if ((Object.isArray(dep) ? dep : dep.split('.', 1))[0] === name) {
							const props = watchPropDependencies.get(path) ?? new Set();

							props.add(name);
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
		Object.entries(field).forEach(([name, field]) => {
			field?.watchers?.forEach((watcher) => {
				if (isFunctional && watcher.functional === false) {
					return;
				}

				const watcherListeners = watchers[name] ?? [];

				watchers[name] = watcherListeners;
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

	Object.entries(methods).forEach(([name, method]) => {
		if (method == null) {
			return;
		}

		if (isFirstFill) {
			component.methods[name] = wrapper;

			if (wrapper.length !== method.fn.length) {
				Object.defineProperty(wrapper, 'length', {get: () => method.fn.length});
			}
		}

		if (method.watchers != null) {
			Object.entries(method.watchers).forEach(([name, watcher]) => {
				if (watcher == null || isFunctional && watcher.functional === false) {
					return;
				}

				const watcherListeners = watchers[name] ?? [];
				watchers[name] = watcherListeners;

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
			Object.entries(method.hooks).forEach(([name, hook]) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (hook == null || isFunctional && hook.functional === false) {
					return;
				}

				hooks[name].push({...hook, fn: method.fn});
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

		Object.entries(meta.mods).forEach(([name, mod]) => {
			let defaultValue: CanUndef<ModVal[]>;

			if (mod != null) {
				mod.some((val) => {
					if (Object.isArray(val)) {
						defaultValue = val;
						return true;
					}

					return false;
				});

				mods[name] = defaultValue !== undefined ? String(defaultValue[0]) : undefined;
			}
		});
	}

	Object.defineProperty(constructor, ALREADY_PASSED, {value: true});

	return meta;
}
