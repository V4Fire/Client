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

export * from 'core/component/decorators/method/interface';

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

		computedFields,
		accessors,
		methods,

		metaInitializers
	} = meta;

	if (type === 'method') {
		const method = proto[name];

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

		const accessor: ComponentAccessor = Object.assign(store[name] ?? {cache: false}, {
			src,
			get,
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
