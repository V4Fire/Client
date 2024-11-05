/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import type {ComponentAccessor, ComponentMeta, ComponentMethod} from 'core/component/interface';
import {getComponentContext} from "core/component/context";

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
		componentName: src,
		props,
		fields,
		systemFields,
		methods,
		component
	} = meta;

	const
		proto = constructor.prototype,
		descriptors = Object.getOwnPropertyDescriptors(proto);

	Object.entries(descriptors).forEach(([name, desc]) => {
		if (name === 'constructor') {
			return;
		}

		// Methods
		if ('value' in desc) {
			let method: ComponentMethod;

			const fn = desc.value;

			if (!Object.isFunction(fn)) {
				return;
			}

			if (methods.hasOwnProperty(name)) {
				method = methods[name]!;
				method.fn = fn;

			} else {
				const parent = methods[name];

				if (parent != null) {
					method = {...parent, src, fn};

					if (parent.hooks != null) {
						method.hooks = Object.create(parent.hooks);
					}

					if (parent.watchers != null) {
						method.watchers = Object.create(parent.watchers);
					}

				} else {
					method = {src, fn};
				}
			}

			methods[name] = method;
			component.methods[name] = fn;

			// eslint-disable-next-line func-style
			const wrapper = function wrapper(this: object) {
				// eslint-disable-next-line prefer-rest-params
				return fn.apply(getComponentContext(this), arguments);
			};

			if (wrapper.length !== fn.length) {
				Object.defineProperty(wrapper, 'length', {get: () => fn.length});
			}

			component.methods[name] = wrapper;

			const {hooks, watchers} = method;

			if (hooks != null || watchers != null) {
				meta.metaInitializers.set(name, (meta) => {
					const isFunctional = meta.params.functional === true;

					if (hooks != null) {
						// eslint-disable-next-line guard-for-in
						for (const hookName in hooks) {
							const hook = hooks[hookName];

							if (hook == null || isFunctional && hook.functional === false) {
								continue;
							}

							meta.hooks[hookName].push({...hook, fn});
						}
					}

					if (watchers != null) {
						// eslint-disable-next-line guard-for-in
						for (const watcherName in watchers) {
							const watcher = watchers[watcherName];

							if (watcher == null || isFunctional && watcher.functional === false) {
								continue;
							}

							const watcherListeners = meta.watchers[watcherName] ?? [];
							meta.watchers[watcherName] = watcherListeners;

							watcherListeners.push({
								...watcher,
								method: name,
								args: Array.toArray(watcher.args),
								handler: fn
							});
						}
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
				meta.computedFields[name] != null ||
				meta.accessors[name] == null && (tiedWith = props[propKey] ?? fields[storeKey] ?? systemFields[storeKey])
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
				field[name] = undefined;
			}

			const
				old = store[name],
				set = desc.set ?? old?.set,
				get = desc.get ?? old?.get;

			let accessor: ComponentAccessor;

			if (store.hasOwnProperty(name)) {
				accessor = store[name]!;

			} else {
				const parent = store[name];

				accessor = {src, cache: false};

				if (parent != null) {
					Object.assign(accessor, parent);
				}
			}

			accessor.get = get;
			accessor.set = set;

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
	});
}
