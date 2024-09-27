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
import { addMethodsToMeta } from 'core/component/meta/method';

import type { ComponentConstructor, ComponentMeta, ModVal } from 'core/component/interface';

const
	INSTANCE = Symbol('The component instance'),
	BLUEPRINT = Symbol('The metaobject blueprint'),
	ALREADY_FILLED = Symbol('This constructor has already been used to populate the metaobject');

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
	const isFirstFill = !constructor.hasOwnProperty(ALREADY_FILLED);

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
			watchers: new Map(blueprint.watchers)
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

	// Creating an instance of a component is not a free operation.
	// If it is not immediately necessary, we execute it in the background during idle time.
	requestIdleCallback(() => {
		void meta.instance;
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
			const skipDefault = !defaultProps && !prop.forceDefault;

			let defaultValue: unknown;

			if (!skipDefault) {
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

		if (prop.watchers != null && prop.watchers.size > 0) {
			const watcherListeners = watchers.get(propName) ?? [];
			watchers.set(propName, watcherListeners);

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

				const watcherListeners = watchers.get(fieldName) ?? [];
				watchers.set(fieldName, watcherListeners);

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

	for (const [methodName, method] of methods) {
		if (isFirstFill) {
			// eslint-disable-next-line func-style
			const wrapper = function wrapper(this: object, ...args: unknown[]) {
				const ctx = getComponentContext(this);

				switch (args.length) {
					case 0: return method.fn.call(ctx);
					case 1: return method.fn.call(ctx, args[0]);
					case 2: return method.fn.call(ctx, args[0], args[1]);
					default: return method.fn.apply(ctx, args);
				}
			};

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

				const watcherListeners = watchers.get(watcherName) ?? [];
				watchers.set(watcherName, watcherListeners);

				watcherListeners.push({
					...watcher,
					method: methodName,
					args: Array.toArray(watcher.args),
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
	}

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

	Object.defineProperty(constructor, ALREADY_FILLED, {value: true});

	return meta;
}
