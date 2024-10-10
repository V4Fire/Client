/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';

import { getComponentContext } from 'core/component/context';
import type { ComponentMeta, ComponentAccessor, ComponentMethod } from 'core/component/interface';

const ALREADY_PASSED = Symbol('This target is passed');

/**
 * Loops through the prototype of the passed component constructor and
 * adds methods and accessors to the specified metaobject
 *
 * @param meta
 * @param [constructor]
 */
export function addMethodsToMeta(meta: ComponentMeta, constructor: Function = meta.constructor): void {
	// For smart components, this method can be called more than once
	if (constructor.hasOwnProperty(ALREADY_PASSED)) {
		return;
	}

	Object.defineProperty(constructor, ALREADY_PASSED, {value: true});

	const {
		component,
		componentName: src,

		props,
		fields,
		systemFields,

		computedFields,
		accessors,
		methods,

		metaInitializers
	} = meta;

	const
		proto = constructor.prototype,
		descriptors = Object.getOwnPropertyDescriptors(proto),
		descriptorKeys = Object.keys(descriptors);

	let parentProto: CanNull<object> = null;

	for (let i = 0; i < descriptorKeys.length; i++) {
		const name = descriptorKeys[i];

		if (name === 'constructor') {
			continue;
		}

		const desc = descriptors[name];

		// Methods
		if ('value' in desc) {
			const method = desc.value;

			if (!Object.isFunction(method)) {
				continue;
			}

			const methodDesc: ComponentMethod = Object.assign(methods[name] ?? {watchers: {}, hooks: {}}, {src, fn: method});
			methods[name] = methodDesc;

			component.methods[name] = method;

			// eslint-disable-next-line func-style
			const wrapper = function wrapper(this: object) {
				// eslint-disable-next-line prefer-rest-params
				return method.apply(getComponentContext(this), arguments);
			};

			if (wrapper.length !== method.length) {
				Object.defineProperty(wrapper, 'length', {get: () => method.length});
			}

			component.methods[name] = wrapper;

			const
				watchers = methodDesc.watchers != null ? Object.keys(methodDesc.watchers) : [],
				hooks = methodDesc.hooks != null ? Object.keys(methodDesc.hooks) : [];

			if (watchers.length > 0 || hooks.length > 0) {
				metaInitializers.set(name, (meta) => {
					const isFunctional = meta.params.functional === true;

					for (const watcherName of watchers) {
						const watcher = methodDesc.watchers![watcherName];

						if (watcher == null || isFunctional && watcher.functional === false) {
							continue;
						}

						const watcherListeners = meta.watchers[watcherName] ?? [];
						meta.watchers[watcherName] = watcherListeners;

						watcherListeners.push({
							...watcher,
							method: name,
							args: Array.toArray(watcher.args),
							handler: method
						});
					}

					for (const hookName of hooks) {
						const hook = methodDesc.hooks![hookName];

						if (isFunctional && hook.functional === false) {
							continue;
						}

						meta.hooks[hookName].push({...hook, fn: method});
					}
				});
			}

		// Accessors
		} else {
			const
				propKey = `${name}Prop`,
				storeKey = `${name}Store`;

			let
				type: 'accessors' | 'computedFields' = 'accessors',
				tiedWith: CanNull<ComponentAccessor['tiedWith']> = null;

			// Computed fields are cached by default
			if (
				name in computedFields ||
				!(name in accessors) && (tiedWith = props[propKey] ?? fields[storeKey] ?? systemFields[storeKey])
			) {
				type = 'computedFields';
			}

			let field: Dictionary;

			if (props[name] != null) {
				field = props;

			} else if (fields[name] != null) {
				field = fields;

			} else {
				field = systemFields;
			}

			const store = meta[type];

			// If we already have a property by this key, like a prop or field,
			// we need to delete it to correct override
			if (field[name] != null) {
				Object.defineProperty(proto, name, defProp);
				delete field[name];
			}

			const
				old = store[name],
				set = desc.set ?? old?.set,
				get = desc.get ?? old?.get;

			parentProto ??= Object.getPrototypeOf(proto);

			if (name in parentProto!) {
				// To use `super` within the setter, we also create a new method with a name `${key}Setter`
				if (set != null) {
					const methodName = `${name}Setter`;
					proto[methodName] = set;

					meta.methods[methodName] = {
						src,
						fn: set,
						watchers: {},
						hooks: {}
					};
				}

				// To using `super` within the getter, we also create a new method with a name `${key}Getter`
				if (get != null) {
					const methodName = `${name}Getter`;
					proto[methodName] = get;

					meta.methods[methodName] = {
						src,
						fn: get,
						watchers: {},
						hooks: {}
					};
				}
			}

			const accessor: ComponentAccessor = Object.assign(store[name] ?? {cache: false}, {
				src,
				get: desc.get ?? old?.get,
				set
			});

			store[name] = accessor;

			if (accessor.cache === 'auto') {
				component.computed[name] = {
					get: accessor.get,
					set: accessor.set
				};
			}

			// eslint-disable-next-line eqeqeq
			if (accessor.functional === undefined && meta.params.functional === null) {
				accessor.functional = false;
			}

			if (tiedWith != null) {
				accessor.tiedWith = tiedWith;
			}
		}
	}
}
