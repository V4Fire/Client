/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, {

	set,
	unset,
	mute,

	watchHandlers,
	MultipleWatchHandler

} from 'core/object/watch';

import { getPropertyInfo, bindingRgxp } from 'core/component/reflection';

import {

	dynamicHandlers,
	immediateDynamicHandlers,

	cacheStatus,
	tiedWatchers,

	watcherInitializer,
	toComponentObject

} from 'core/component/watch/const';

import { createWatchFn } from 'core/component/watch/create';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

import type { ComponentInterface, RawWatchHandler } from 'core/component/interface';
import type { ImplementComponentWatchAPIOptions } from 'core/component/watch/interface';

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
	const {
		unsafe,
		unsafe: {$async: $a, meta: {watchDependencies, computedFields, accessors, params}},
		$renderEngine: {proxyGetters}
	} = component;

	const
		isNotRegular = Boolean(component.isFlyweight) || params.functional === true,
		usedHandlers = new Set<Function>();

	let
		timerId;

	// The handler to invalidate the cache of computed fields
	// eslint-disable-next-line @typescript-eslint/typedef
	const invalidateComputedCache = () => <RawWatchHandler>function invalidateComputedCache(val, oldVal, info) {
		if (info == null) {
			return;
		}

		const
			{path} = info,
			rootKey = String(path[0]);

		// If was changed there properties that can affect cached computed fields,
		// then we need to invalidate these caches
		if (computedFields[rootKey]?.get != null) {
			delete Object.getOwnPropertyDescriptor(component, rootKey)?.get?.[cacheStatus];
		}

		// We need to provide this mutation to other listeners.
		// This behavior fixes the bug when we have some accessor that depends on a property from another component.

		const
			ctx = invalidateComputedCache[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
			currentDynamicHandlers = immediateDynamicHandlers.get(ctx)?.[rootKey];

		if (currentDynamicHandlers) {
			for (let o = currentDynamicHandlers.values(), el = o.next(); !el.done; el = o.next()) {
				el.value(val, oldVal, info);
			}
		}
	};

	// The handler to broadcast events of accessors
	// eslint-disable-next-line @typescript-eslint/typedef
	const emitAccessorEvents = () => <MultipleWatchHandler>function emitAccessorEvents(mutations, ...args) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (args.length > 0) {
			mutations = [Object.cast([mutations, ...args])];
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

			if (info.parent != null) {
				const
					{path: parentPath} = info.parent.info;

				if (parentPath[parentPath.length - 1] === '__proto__') {
					continue;
				}
			}

			const
				rootKey = String(path[0]),
				ctx = emitAccessorEvents[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
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

					if (timerId == null) {
						timerId = setImmediate(() => {
							timerId = undefined;
							usedHandlers.clear();
						});
					}
				}
			}
		}
	};

	const
		fieldsInfo = proxyGetters.field(component),
		systemFieldsInfo = proxyGetters.system(component);

	const watchOpts = {
		deep: true,
		withProto: true,
		collapse: true,
		postfixes: ['Store'],
		dependencies: watchDependencies
	};

	// We need to manage situations when we have accessors with dependencies from external components,
	// that why we iterate over all dependencies list,
	// find external dependencies and attach watchers that directly update state
	if (watchDependencies.size > 0) {
		const
			immediateHandler = invalidateComputedCache(),
			handler = emitAccessorEvents();

		handler[tiedWatchers] = [];
		immediateHandler[tiedWatchers] = handler[tiedWatchers];

		const watchOpts = {
			deep: true,
			withProto: true
		};

		for (let o = watchDependencies.entries(), el = o.next(); !el.done; el = o.next()) {
			const
				[key, deps] = el.value;

			const
				newDeps = <typeof deps>[];

			let
				needForkDeps = false;

			for (let j = 0; j < deps.length; j++) {
				const
					dep = deps[j],
					info = getPropertyInfo(Array.concat([], dep).join('.'), component);

				newDeps[j] = dep;

				if (info.ctx === component && !watchDependencies.has(dep)) {
					needForkDeps = true;
					newDeps[j] = info.path;
					continue;
				}

				const invalidateCache = (value, oldValue, info) => {
					info = Object.assign(Object.create(info), {
						path: [key],
						parent: {value, oldValue, info}
					});

					immediateHandler(value, oldValue, info);
				};

				attachDynamicWatcher(
					component,
					info,

					{
						...watchOpts,
						immediate: true
					},

					invalidateCache,
					immediateDynamicHandlers
				);

				const broadcastEvents = (mutations, ...args) => {
					if (args.length > 0) {
						mutations = [Object.cast([mutations, ...args])];
					}

					const
						modifiedMutations = <any[]>[];

					for (let i = 0; i < mutations.length; i++) {
						const
							[value, oldValue, info] = mutations[i];

						modifiedMutations.push([
							value,
							oldValue,

							Object.assign(Object.create(info), {
								path: [key],
								parent: {value, oldValue, info}
							})
						]);
					}

					handler(modifiedMutations);
				};

				attachDynamicWatcher(component, info, watchOpts, broadcastEvents, dynamicHandlers);
			}

			if (needForkDeps) {
				watchDependencies.set(key, newDeps);
			}
		}
	}

	let
		fieldWatchOpts;

	if (!isNotRegular && opts?.tieFields) {
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

		if (isNotRegular) {
			// We need to track all modified fields of a function instance
			// to restore state if a parent has re-created the component
			const w = watch(watcher.proxy, {deep: true, collapse: true, immediate: true}, (v, o, i) => {
				unsafe.$modifiedFields[String(i.path[0])] = true;
			});

			$a.worker(() => w.unwatch());
		}
	};

	// Watcher of fields

	let
		fieldsWatcher;

	const initFieldsWatcher = () => {
		const immediateFieldWatchOpts = {
			...fieldWatchOpts,
			immediate: true
		};

		fieldsWatcher = watch(fieldsInfo.value, immediateFieldWatchOpts, invalidateComputedCache());
		$a.worker(() => fieldsWatcher.unwatch());

		{
			const w = watch(fieldsWatcher.proxy, fieldWatchOpts, emitAccessorEvents());
			$a.worker(() => w.unwatch());
		}

		initWatcher(fieldsInfo.key, fieldsWatcher);
	};

	if (isNotRegular) {
		// Don't force watching of fields until it becomes necessary
		fieldsInfo.value[watcherInitializer] = () => {
			delete fieldsInfo.value[watcherInitializer];
			initFieldsWatcher();
		};

	} else {
		initFieldsWatcher();
	}

	// Don't force watching of system fields until it becomes necessary
	systemFieldsInfo.value[watcherInitializer] = () => {
		delete systemFieldsInfo.value[watcherInitializer];

		const immediateSystemWatchOpts = {
			...watchOpts,
			immediate: true
		};

		const systemFieldsWatcher = watch(systemFieldsInfo.value, immediateSystemWatchOpts, invalidateComputedCache());
		$a.worker(() => systemFieldsWatcher.unwatch());

		{
			const w = watch(systemFieldsWatcher.proxy, watchOpts, emitAccessorEvents());
			$a.worker(() => w.unwatch());
		}

		initWatcher(systemFieldsInfo.key, systemFieldsWatcher);
	};

	// Register the base watch API methods

	Object.defineProperty(component, '$watch', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: createWatchFn(component)
	});

	Object.defineProperty(component, '$set', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path, val) => {
			set(obj, path, val, obj[watchHandlers] ?? fieldsWatcher?.proxy[watchHandlers]);
			return val;
		}
	});

	Object.defineProperty(component, '$delete', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path) => {
			unset(obj, path, obj[watchHandlers] ?? fieldsWatcher?.proxy[watchHandlers]);
		}
	});

	// Watching of component props.
	// The root component and functional/flyweight components can't watch props.
	if (!isNotRegular && !params.root) {
		const
			props = proxyGetters.prop(component),
			propsStore = props.value;

		// We need to attach a watcher for a prop object
		// and watchers for each non-primitive value of that object, like arrays or maps.
		if (Object.isTruly(propsStore)) {
			const propWatchOpts = {
				...watchOpts,
				postfixes: ['Prop']
			};

			// If a component engine does not have the own mechanism of watching
			// we need to wrap a prop object
			if (!('watch' in props)) {
				const propsWatcher = watch(propsStore, propWatchOpts);
				$a.worker(() => propsWatcher.unwatch());
				initWatcher((<Dictionary>props).key, propsWatcher);
			}

			// We need to attach default watchers for all props that can affect component computed fields
			if (Object.size(computedFields) > 0 || Object.size(accessors) > 0) {
				for (let keys = Object.keys(propsStore), i = 0; i < keys.length; i++) {
					const
						prop = keys[i],

						// Remove from the prop name "Store" and "Prop" postfixes
						normalizedKey = prop.replace(bindingRgxp, '');

					let
						tiedLinks,
						needWatch = Boolean(computedFields[normalizedKey] ?? accessors[normalizedKey]);

					// We have some accessor that tied with this prop
					if (needWatch) {
						tiedLinks = [[normalizedKey]];

					// We don't have the direct connection between the prop and any accessor,
					// but we have a set of dependencies, so we need to check it
					} else if (watchDependencies.size > 0) {
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
						const
							immediateHandler = invalidateComputedCache(),
							handler = emitAccessorEvents();

						// Provide the list of connections to handlers
						invalidateComputedCache[tiedWatchers] = tiedLinks;
						emitAccessorEvents[tiedWatchers] = tiedLinks;

						unsafe.$watch(prop, {...propWatchOpts, immediate: true}, immediateHandler);
						unsafe.$watch(prop, propWatchOpts, handler);
					}
				}
			}
		}
	}
}
