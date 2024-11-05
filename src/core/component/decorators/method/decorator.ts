/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';

import { createComponentDecorator3 } from 'core/component/decorators/helpers';

import { getComponentContext } from 'core/component/context';

import type { ComponentMeta } from 'core/component/meta';
import type { ComponentAccessor, ComponentMethod } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';
import type { MethodType } from 'core/component/decorators/method/interface';

/**
 * Marks a class method or accessor as a component part.
 *
 * Typically, this decorator does not need to be used explicitly,
 * as it will be automatically added in the appropriate places during the build process.
 *
 * @decorator
 * @param type - the type of the member: `method` or `accessor`
 *
 * @example
 * ```typescript
 * import { method } from 'core/component/decorators/method';
 * import iBlock, { component, prop, system } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @method('accessor')
 *   get answer() {
 *     return 42;
 *   }
 *
 *   @method('method')
 *   just() {
 *     return 'do it';
 *   }
 * }
 * ```
 */
export function method(type: MethodType): PartDecorator {
	return createComponentDecorator3((desc, name, proto) => {
		regMethod(name, type, desc.meta, proto);
	});
}

/**
 * Registers a method or accessor in the specified metaobject
 *
 * @param name - the name of the method or accessor to be registered
 * @param type - the type of the member: `method` or `accessor`
 * @param meta - the metaobject where the member is registered
 * @param proto - the prototype of the class where the method or accessor is defined
 */
export function regMethod(name: string, type: MethodType, meta: ComponentMeta, proto: object): void {
	const {
		component,
		componentName: src,

		props,
		fields,
		systemFields,

		methods
	} = meta;

	if (type === 'method') {
		let method: ComponentMethod;

		const fn = proto[name];

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

	} else {
		const desc = Object.getOwnPropertyDescriptor(proto, name);

		if (desc == null) {
			return;
		}

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

			// eslint-disable-next-line @v4fire/unbound-method
			set = desc.set ?? old?.set,

			// eslint-disable-next-line @v4fire/unbound-method
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
}
