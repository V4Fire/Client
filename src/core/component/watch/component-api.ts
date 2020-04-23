/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { set, unset, mute, watchHandlers, WatchHandler, MultipleWatchHandler } from 'core/object/watch';

import { bindingRgxp } from 'core/component/reflection';
import { proxyGetters } from 'core/component/engines';

import { cacheStatus, watcherInitializer, toComponentObject } from 'core/component/watch/const';
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
		{meta, meta: {watchDependencies, computedFields, accessors, params}} = component;

	const
		isFlyweight = component.isFlyweight || meta.params.functional === true,
		dynamicHandlers = new WeakMap<ComponentInterface, Dictionary<Set<Function>>>(),
		usedHandlers = new Set<Function>();

	let
		timerId;

	const invalidateComputedCache: WatchHandler = (val, oldVal, info) => {
		if (!info) {
			return;
		}

		const
			{path} = info;

		if (info.parent) {
			const
				rootKey = String(path[0]);

			// If was changed there properties that can affect cached computed fields,
			// then we need to invalidate these caches
			if (meta.computedFields[rootKey]?.get) {
				delete Object.getOwnPropertyDescriptor(component, rootKey)?.get?.[cacheStatus];
			}
		}
	};

	const emitAccessorEvents: MultipleWatchHandler = (mutations, ...args) => {
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

			// This mutation can affect computed fields or accessors
			if (info.parent) {
				const
					{path: parentPath} = info.parent.info;

				if (parentPath[parentPath.length - 1] === '__proto__') {
					continue;
				}

				const
					rootKey = String(path[0]),
					ctx = emitAccessorEvents[cacheStatus] ? component : info.root[toComponentObject] || component,
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
		postfixes: ['Store'],
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

	// Initializes the specified watcher on a component instance
	const initWatcher = (name, watcher) => {
		mute(watcher.proxy);
		watcher.proxy[toComponentObject] = component;
		Object.defineProperty(component, name, {
			enumerable: true,
			configurable: true,
			value: watcher.proxy
		});
	};

	// Watcher of fields
	const fieldsWatcher = watch(fields.value, {...fieldWatchOpts, immediate: true}, invalidateComputedCache);
	watch(fieldsWatcher.proxy, fieldWatchOpts, emitAccessorEvents);
	initWatcher(fields.key, fieldsWatcher);

	// Don't force watching of system fields until it becomes necessary
	systemFields.value[watcherInitializer] = () => {
		delete systemFields.value[watcherInitializer];
		const systemFieldsWatcher = watch(systemFields.value, {...watchOpts, immediate: true}, invalidateComputedCache);
		watch(systemFieldsWatcher.proxy, watchOpts, emitAccessorEvents);
		initWatcher(systemFields.key, systemFieldsWatcher);
	};

	// Register the base watch API methods

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

	// Watching of component props.
	// The root component and functional/flyweight components can't watch props.
	if (!isFlyweight && !params.root)  {
		const
			props = proxyGetters.prop(component),
			propsStore = props.value;

		// We need to attach a watcher for a prop object
		// and watchers for each non primitive value of that object, like arrays or maps.
		if (propsStore) {
			const propWatchOpts = {
				...watchOpts,
				postfixes: ['Prop']
			};

			// If a component engine doesn't have the own mechanism of watching
			// we need to wrap a prop object
			if (!('watch' in props)) {
				const propsWatcher = watch(propsStore, propWatchOpts);
				initWatcher(props!.key, propsWatcher);
			}

			// We need to attach default watchers for all props that can affect component computed fields
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

					// Skip redundant watchers
					if (needWatch) {
						emitAccessorEvents[cacheStatus] = tiedLinks;

						// @ts-ignore (access)
						component.$watch(prop, {...propWatchOpts, immediate: true}, invalidateComputedCache);

						// @ts-ignore (access)
						component.$watch(prop, propWatchOpts, emitAccessorEvents);
					}
				}
			}
		}
	}
}
