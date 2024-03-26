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
	MultipleWatchHandler,

	Watcher,
	WatchHandlerParams

} from 'core/object/watch';

import { getPropertyInfo } from 'core/component/reflect';

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

/**
 * Implements watch API to the passed component instance
 * @param component
 */
export function implementComponentWatchAPI(component: ComponentInterface): void {
	const {
		unsafe,
		unsafe: {$async: $a, meta: {computedFields, watchDependencies, watchPropDependencies, params}},
		$renderEngine: {proxyGetters}
	} = component;

	const
		isFunctional = SSR || params.functional === true,
		usedHandlers = new Set<Function>();

	let
		timerId;

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
	// that's why we iterate over the all dependencies list,
	// find external dependencies and attach watchers that directly update state
	if (watchDependencies.size > 0) {
		const
			invalidateComputedCache = createComputedCacheInvalidator(),
			broadcastAccessorMutations = createAccessorMutationEmitter();

		broadcastAccessorMutations[tiedWatchers] = [];
		invalidateComputedCache[tiedWatchers] = broadcastAccessorMutations[tiedWatchers];

		const watchOpts = {
			deep: true,
			withProto: true
		};

		watchDependencies.forEach((deps, path) => {
			const
				newDeps: typeof deps = [];

			let
				needForkDeps = false;

			deps.forEach((dep, i) => {
				newDeps[i] = dep;

				const
					depPath = Object.isString(dep) ? dep : dep.join('.'),
					watchInfo = getPropertyInfo(depPath, component);

				if (watchInfo.ctx === component && !watchDependencies.has(dep)) {
					needForkDeps = true;
					newDeps[i] = watchInfo.path;
					return;
				}

				const invalidateCache = (value, oldValue, info) => {
					info = Object.assign(Object.create(info), {
						path: Array.concat([], path),
						parent: {value, oldValue, info}
					});

					invalidateComputedCache(value, oldValue, info);
				};

				attachDynamicWatcher(
					component,
					watchInfo,

					{
						...watchOpts,
						immediate: true
					},

					invalidateCache,
					immediateDynamicHandlers
				);

				const broadcastMutations = (mutations, ...args) => {
					if (args.length > 0) {
						mutations = [Object.cast([mutations, ...args])];
					}

					const
						modifiedMutations: Array<[unknown, unknown, WatchHandlerParams]> = [];

					mutations.forEach(([value, oldValue, info]) => {
						modifiedMutations.push([
							value,
							oldValue,

							Object.assign(Object.create(info), {
								path: Array.concat([], path),

								originalPath: watchInfo.type === 'mounted' ?
									[watchInfo.name, ...info.originalPath] :
									info.originalPath,

								parent: {value, oldValue, info}
							})
						]);
					});

					broadcastAccessorMutations(modifiedMutations);
				};

				attachDynamicWatcher(component, watchInfo, watchOpts, broadcastMutations, dynamicHandlers);
			});

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (needForkDeps) {
				watchDependencies.set(path, newDeps);
			}
		});
	}

	// Watcher of fields

	let
		fieldsWatcher;

	if (isFunctional) {
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

		const systemFieldsWatcher = watch(
			systemFieldsInfo.value,
			immediateSystemWatchOpts,
			createComputedCacheInvalidator()
		);

		$a.worker(() => systemFieldsWatcher.unwatch());

		{
			const w = watch(
				systemFieldsWatcher.proxy,
				watchOpts,
				createAccessorMutationEmitter()
			);

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
	// The root component and functional components can't watch their props.
	if (!isFunctional && !params.root) {
		const
			props = proxyGetters.prop(component),
			propsStore = props.value;

		// We need to attach a watcher for a prop object
		// and watchers for each non-primitive value of that object, like arrays or maps
		if (Object.isTruly(propsStore)) {
			const propWatchOpts = {
				...watchOpts,
				postfixes: ['Prop']
			};

			// If a component engine does not have the own mechanism of watching,
			// we need to wrap a prop object by myself
			if (!('watch' in props)) {
				const propsWatcher = watch(propsStore, propWatchOpts);
				$a.worker(() => propsWatcher.unwatch());
				initWatcher(props.key, propsWatcher);
			}

			// We need to attach default watchers for all props that can affect component computed fields
			if (watchPropDependencies.size > 0) {
				for (const [path, props] of watchPropDependencies.entries()) {
					const
						invalidateComputedCache = createComputedCacheInvalidator(),
						broadcastAccessorMutations = createAccessorMutationEmitter();

					const
						tiedLinks = Object.isArray(path) ? [path] : [[path]];

					// Provide a list of connections to the handlers
					invalidateComputedCache[tiedWatchers] = tiedLinks;
					broadcastAccessorMutations[tiedWatchers] = tiedLinks;

					props.forEach((prop) => {
						unsafe.$watch(prop, {...propWatchOpts, flush: 'sync'}, invalidateComputedCache);
						unsafe.$watch(prop, propWatchOpts, broadcastAccessorMutations);
					});
				}
			}
		}
	}

	function initWatcher(name: Nullable<string>, watcher: Watcher) {
		if (name == null) {
			return;
		}

		mute(watcher.proxy);
		watcher.proxy[toComponentObject] = component;

		Object.defineProperty(component, name, {
			enumerable: true,
			configurable: true,
			value: watcher.proxy
		});

		if (isFunctional) {
			// We need to track all modified fields of the functional instance
			// to restore state if a parent has re-created the component
			const w = watch(watcher.proxy, {deep: true, collapse: true, immediate: true}, (v, o, i) => {
				unsafe.$modifiedFields[String(i.path[0])] = true;
			});

			$a.worker(() => w.unwatch());
		}
	}

	function initFieldsWatcher() {
		const immediateFieldWatchOpts = {
			...watchOpts,
			immediate: true
		};

		fieldsWatcher = watch(
			fieldsInfo.value,
			immediateFieldWatchOpts,
			createComputedCacheInvalidator()
		);

		$a.worker(() => fieldsWatcher.unwatch());

		{
			const w = watch(
				fieldsWatcher.proxy,
				watchOpts,
				createAccessorMutationEmitter()
			);

			$a.worker(() => w.unwatch());
		}

		initWatcher(fieldsInfo.key, fieldsWatcher);
	}

	function createComputedCacheInvalidator(): RawWatchHandler {
		// eslint-disable-next-line @typescript-eslint/typedef
		return function invalidateComputedCache(val, ...args) {
			const
				oldVal = args[0],
				info = args[1];

			if (info == null) {
				return;
			}

			const
				rootKey = String(info.path[0]);

			// If there has been changed properties that can affect memoized computed fields,
			// then we need to invalidate these caches
			if (computedFields[rootKey]?.get != null) {
				delete Object.getOwnPropertyDescriptor(component, rootKey)?.get?.[cacheStatus];
			}

			// We need to provide this mutation to other listeners.
			// This behavior fixes a bug when we have some accessor that depends on a property from another component.

			const
				ctx = invalidateComputedCache[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
				currentDynamicHandlers = immediateDynamicHandlers.get(ctx)?.[rootKey];

			currentDynamicHandlers?.forEach((handler) => {
				handler(val, oldVal, info);
			});
		};
	}

	function createAccessorMutationEmitter(): MultipleWatchHandler {
		// eslint-disable-next-line @typescript-eslint/typedef
		return function emitAccessorEvents(mutations, ...args) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (args.length > 0) {
				mutations = [Object.cast([mutations, ...args])];
			}

			mutations.forEach(([val, oldVal, info]) => {
				const
					{path} = info;

				if (path[path.length - 1] === '__proto__') {
					return;
				}

				if (info.parent != null) {
					const
						{path: parentPath} = info.parent.info;

					if (parentPath[parentPath.length - 1] === '__proto__') {
						return;
					}
				}

				const
					rootKey = String(path[0]),
					ctx = emitAccessorEvents[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
					currentDynamicHandlers = dynamicHandlers.get(ctx)?.[rootKey];

				currentDynamicHandlers?.forEach((handler) => {
					// Because we register several watchers (props, fields, etc.) at the same time,
					// we need to control that every dynamic handler must be invoked no more than one time per tick
					if (usedHandlers.has(handler)) {
						return;
					}

					handler(val, oldVal, info);
					usedHandlers.add(handler);

					if (timerId == null) {
						timerId = setImmediate(() => {
							timerId = undefined;
							usedHandlers.clear();
						});
					}
				});
			});
		};
	}
}
