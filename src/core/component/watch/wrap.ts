/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { MultipleWatchHandler, Watcher } from 'core/object/watch';

import { getPropertyInfo } from 'core/component/reflection';
import { cacheStatus, proxyGetters, toWatcher, toComponent } from 'core/component/watch/const';
import { createWatchFn } from 'core/component/watch/create';

import { ComponentInterface } from 'core/component/interface';

/**
 * Initializes a watcher of the specified component
 * @param component
 */
export function initComponentWatcher(component: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{meta, $props, $systemFields, $fields} = component;

	const watchOpts = {
		deep: true,
		collapse: true,
		postfixes: ['Store', 'Prop'],
		dependencies: meta.watchDependencies
	};

	const
		dynamicHandlers = new WeakMap<ComponentInterface, Dictionary<Set<Function>>>(),
		usedHandlers = new Set<Function>();

	let
		timerId;

	const handler: MultipleWatchHandler = (mutations) => {
		for (let i = 0; i < mutations.length; i++) {
			const
				args = mutations[i],
				info = args[2];

			if (info.parent) {
				const
					nm = String(info.path[0]);

				if (meta.computedFields[nm]?.get) {
					delete Object.getOwnPropertyDescriptor(component, nm)?.get?.[cacheStatus];
				}

				const
					rootKey = String(info.path[0]),
					currentDynamicHandlers = dynamicHandlers.get(info.obj[toComponent])?.[rootKey];

				if (currentDynamicHandlers) {
					for (let o = currentDynamicHandlers.values(), el = o.next(); !el.done; el = o.next()) {
						const
							handler = el.value;

						if (usedHandlers.has(handler)) {
							continue;
						}

						handler();
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
		propsWatcher = watch($props, watchOpts, handler),
		systemFieldsWatcher = watch($systemFields, watchOpts, handler),
		fieldsWatcher = watch($fields, {tiedWith: component, ...watchOpts}, handler);

	const watchers = <[string, Watcher<object>][]>[
		['$props', propsWatcher],
		['$fields', fieldsWatcher],
		['$systemFields', systemFieldsWatcher]
	];

	for (let i = 0; i < watchers.length; i++) {
		const [key, watcher] = watchers[i];
		watcher.proxy[toWatcher] = watcher;
		watcher.proxy[toComponent] = component;
		Object.defineProperty(component, key, {
			enumerable: true,
			configurable: true,
			value: watcher.proxy
		});
	}

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
		value: (path, val) => {
			const
				info = getPropertyInfo(path, component),
				getData = proxyGetters[info.type];

			if (getData) {
				getData(info.ctx)?.[toWatcher]?.set?.(path, val);
			}
		}
	});

	Object.defineProperty(component, '$delete', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (path) => {
			const
				info = getPropertyInfo(path, component),
				getData = proxyGetters[info.type];

			if (getData) {
				getData(info.ctx)?.[toWatcher]?.delete?.(path);
			}
		}
	});
}
