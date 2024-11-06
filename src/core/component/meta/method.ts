/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { getComponentContext } from 'core/component/context';

import type { RegisteredComponent } from 'core/component/decorators';
import type { ComponentAccessor, ComponentMeta, ComponentMethod } from 'core/component/interface';

const ALREADY_PASSED = Symbol('This target is passed');

/**
 * Loops through the prototype of the passed component constructor and
 * adds methods and accessors to the specified metaobject
 *
 * @param meta
 * @param registeredComponent - the descriptor of the registered component
 * @param [constructor]
 */
export function addMethodsToMeta(
	meta: ComponentMeta,
	registeredComponent: Required<RegisteredComponent>,
	constructor: Function = meta.constructor
): void {
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
		methods
	} = meta;

	const proto = constructor.prototype;

	for (let i = 0; i < registeredComponent.methods.length; i++) {
		const
			methodName = registeredComponent.methods[i],
			fn = proto[methodName];

		if (!Object.isFunction(fn)) {
			continue;
		}

		let method: ComponentMethod;

		if (methods.hasOwnProperty(methodName)) {
			method = methods[methodName]!;
			method.fn = fn;

		} else {
			const parent = methods[methodName];

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

		methods[methodName] = method;
		component.methods[methodName] = fn;

		// eslint-disable-next-line func-style
		const wrapper = function wrapper(this: object) {
			// eslint-disable-next-line prefer-rest-params
			return fn.apply(getComponentContext(this), arguments);
		};

		if (wrapper.length !== fn.length) {
			Object.defineProperty(wrapper, 'length', {get: () => fn.length});
		}

		component.methods[methodName] = wrapper;

		const {hooks, watchers} = method;

		if (hooks != null || watchers != null) {
			meta.metaInitializers.set(methodName, (meta) => {
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
							method: methodName,
							args: Array.toArray(watcher.args),
							handler: fn
						});
					}
				}
			});
		}
	}

	for (let i = 0; i < registeredComponent.accessors.length; i++) {
		const
			accessorName = registeredComponent.accessors[i],
			desc = Object.getOwnPropertyDescriptor(proto, accessorName);

		if (desc == null) {
			continue;
		}

		const
			propKey = `${accessorName}Prop`,
			storeKey = `${accessorName}Store`;

		let
			type: 'accessors' | 'computedFields' = 'accessors',
			tiedWith: CanNull<ComponentAccessor['tiedWith']> = null;

		// Computed fields are cached by default
		if (
			meta.computedFields[accessorName] != null ||
			meta.accessors[accessorName] == null && (tiedWith = props[propKey] ?? fields[storeKey] ?? systemFields[storeKey])
		) {
			type = 'computedFields';
		}

		let field: Dictionary;

		if (props[accessorName] != null) {
			field = props;

		} else if (fields[accessorName] != null) {
			field = fields;

		} else {
			field = systemFields;
		}

		const store = meta[type];

		// If we already have a property by this key, like a prop or field,
		// we need to delete it to correct override
		if (field[accessorName] != null) {
			Object.defineProperty(proto, accessorName, defProp);
			field[accessorName] = undefined;
		}

		const
			old = store[accessorName],

			// eslint-disable-next-line @v4fire/unbound-method
			set = desc.set ?? old?.set,

			// eslint-disable-next-line @v4fire/unbound-method
			get = desc.get ?? old?.get;

		let accessor: ComponentAccessor;

		if (store.hasOwnProperty(accessorName)) {
			accessor = store[accessorName]!;

		} else {
			const parent = store[accessorName];

			accessor = {src, cache: false};

			if (parent != null) {
				Object.assign(accessor, parent);
			}
		}

		accessor.get = get;
		accessor.set = set;

		store[accessorName] = accessor;

		if (accessor.cache === 'auto') {
			component.computed[accessorName] = {
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
