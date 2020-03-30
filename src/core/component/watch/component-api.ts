/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { set, unset, watchHandlers, MultipleWatchHandler } from 'core/object/watch';

import { bindingRgxp } from 'core/component/reflection';
import { proxyGetters } from 'core/component/engines';

import { cacheStatus, toComponentObject } from 'core/component/watch/const';
import { createWatchFn } from 'core/component/watch/create';

import { ComponentInterface } from 'core/component/interface';
import { ImplementComponentWatchAPIOptions } from 'core/component/watch/interface';

/**
 * Implements the base component watch API to a component instance
 *
 * @param component
 * @param [opts] - additional options
 */
export function implementComponentWatchAPI(
	component: ComponentInterface,
	opts?: ImplementComponentWatchAPIOptions
): void {
	const
		// @ts-ignore (access)
		{meta, meta: {watchDependencies, computedFields, accessors}} = component;

	const
		dynamicHandlers = new WeakMap<ComponentInterface, Dictionary<Set<Function>>>(),
		usedHandlers = new Set<Function>();

	let
		timerId;

	const handler: MultipleWatchHandler = (mutations, ...args) => {
		if (args.length) {
			mutations = [<any>[mutations, ...args]];
		}

		for (let i = 0; i < mutations.length; i++) {
			const
				eventArgs = mutations[i],
				info = eventArgs[2];

			const
				{path} = info;

			if (path[path.length - 1] === '__proto__') {
				continue;
			}

			// This mutation can affect on computed fields or accessors
			if (info.parent) {
				const
					{path: parentPath} = info.parent.info;

				if (parentPath[parentPath.length - 1] === '__proto__') {
					continue;
				}

				const
					rootKey = String(path[0]);

				// If was changed there properties that can affect on cached computed fields,
				// then we need to invalidate these caches
				if (meta.computedFields[rootKey]?.get) {
					delete Object.getOwnPropertyDescriptor(component, rootKey)?.get?.[cacheStatus];
				}

				const
					ctx = handler[cacheStatus] ? component : info.root[toComponentObject] || component,
					currentDynamicHandlers = dynamicHandlers.get(ctx)?.[rootKey];

				if (currentDynamicHandlers) {
					for (let o = currentDynamicHandlers.values(), el = o.next(); !el.done; el = o.next()) {
						const
							handler = el.value;

						// Because we register several watchers (props, fields, etc.) at the same time,
						// we need to control that every dynamic handler must be invoked no more than one time per tick
						if (usedHandlers.has(handler)) {
							continue;
						}

						handler(...eventArgs);
						usedHandlers.add(handler);

						if (!timerId) {
							// tslint:disable-next-line:no-string-literal
							timerId = globalThis['setImmediate'](() => {
								timerId = undefined;
								usedHandlers.clear();
							});
						}
					}
				}
			}
		}
	};

	const
		fields = proxyGetters.field(component),
		systemFields = proxyGetters.system(component);

	const watchOpts = {
		deep: true,
		withProto: true,
		collapse: true,
		postfixes: ['Store', 'Prop'],
		dependencies: watchDependencies
	};

	let
		fieldWatchOpts;

	// tslint:disable-next-line:prefer-conditional-expression
	if (opts?.tieFields) {
		fieldWatchOpts = {...watchOpts, tiedWith: component};

	} else {
		fieldWatchOpts = watchOpts;
	}

	const
		fieldsWatcher = watch(fields.value, fieldWatchOpts, handler),
		systemFieldsWatcher = watch(systemFields.value, watchOpts, handler);

	const initWatcher = (name, watcher) => {
		watcher.proxy[toComponentObject] = component;
		Object.defineProperty(component, name, {
			enumerable: true,
			configurable: true,
			value: watcher.proxy
		});
	};

	initWatcher(fields.key, fieldsWatcher);
	initWatcher(systemFields.key, systemFieldsWatcher);

	Object.defineProperty(component, '$watch', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: createWatchFn(component, dynamicHandlers)
	});

	Object.defineProperty(component, '$set', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path, val) => {
			set(obj, path, val, obj[watchHandlers] || fieldsWatcher.proxy[watchHandlers]);
			return val;
		}
	});

	Object.defineProperty(component, '$delete', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path) => {
			unset(obj, path, obj[watchHandlers] || fieldsWatcher.proxy[watchHandlers]);
		}
	});

	if (!meta.params.root) {
		const
			props = proxyGetters.prop(component),
			propsStore = props.value;

		if (propsStore) {
			if (!('watch' in props)) {
				const propsWatcher = watch(propsStore, watchOpts, () => undefined);
				initWatcher(props!.key, propsWatcher);
			}

			if (Object.size(computedFields) || Object.size(accessors)) {
				for (let keys = Object.keys(propsStore), i = 0; i < keys.length; i++) {
					const
						prop = keys[i],
						normalizedKey = prop.replace(bindingRgxp, '');

					let
						tiedLinks,
						needWatch = Boolean(computedFields[normalizedKey] || accessors[normalizedKey]);

					if (needWatch) {
						tiedLinks = [[normalizedKey]];
					}

					if (!needWatch && watchDependencies.size) {
						tiedLinks = [];

						for (let o = watchDependencies.entries(), el = o.next(); !el.done; el = o.next()) {
							const
								[key, deps] = el.value;

							for (let j = 0; j < deps.length; j++) {
								const
									dep = deps[j];

								if ((Object.isArray(dep) ? dep[0] : dep) === prop) {
									needWatch = true;
									tiedLinks.push([key]);
									break;
								}
							}
						}
					}

					if (needWatch) {
						handler[cacheStatus] = tiedLinks;

						// @ts-ignore (access)
						component.$watch(prop, watchOpts, handler);
					}
				}
			}
		}
	}
}
