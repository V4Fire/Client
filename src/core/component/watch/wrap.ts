/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { MultipleWatchHandler, Watcher } from 'core/object/watch';

import { getPropertyInfo } from 'core/component/reflection';
import { cacheStatus, toWatcherObject, toComponentObject } from 'core/component/watch/const';
import { createWatchFn } from 'core/component/watch/create';
import { proxyGetters } from 'core/component/engines';

import { ComponentInterface } from 'core/component/interface';

/**
 * Initializes a watcher of the specified component
 * @param component
 */
export function initComponentWatcher(component: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{meta} = component;

	const watchOpts = {
		deep: true,
		withProto: true,
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
					currentDynamicHandlers = dynamicHandlers.get(info.obj[toComponentObject])?.[rootKey];

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
		fields = proxyGetters.field(component),
		systemFields = proxyGetters.system(component);

	const
		fieldsWatcher = watch(fields.value, watchOpts, handler),
		systemFieldsWatcher = watch(systemFields.value, watchOpts, handler);

	const watchers = <[string, Watcher][]>[
		[fields.key, fieldsWatcher],
		[systemFields.key, systemFieldsWatcher]
	];

	if (!meta.params.root) {
		const
			props = proxyGetters.prop(component),
			propsWatcher = watch(props.value, {...watchOpts, ...props.opts}, handler);

		watchers.push([props.key, propsWatcher]);
	}

	for (let i = 0; i < watchers.length; i++) {
		const [key, watcher] = watchers[i];
		watcher.proxy[toWatcherObject] = watcher;
		watcher.proxy[toComponentObject] = component;
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
				info = getPropertyInfo(path, component);

			if (info.type === 'prop') {
				return val;
			}

			const
				getData = proxyGetters[info.type];

			if (getData) {
				getData(info.ctx).value[toWatcherObject]?.set?.(path, val);
			}

			return val;
		}
	});

	Object.defineProperty(component, '$delete', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (path) => {
			const
				info = getPropertyInfo(path, component);

			if (info.type === 'prop') {
				return;
			}

			const
				getData = proxyGetters[info.type];

			if (getData) {
				getData(info.ctx).value[toWatcherObject]?.delete?.(path);
			}
		}
	});
}
