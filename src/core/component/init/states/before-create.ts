/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import { getComponentContext } from 'core/component/context';

import { forkMeta } from 'core/component/meta';
import { getPropertyInfo, PropertyInfo } from 'core/component/reflect';
import { getNormalParent } from 'core/component/traverse';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { runHook } from 'core/component/hook';
import { implementEventEmitterAPI } from 'core/component/event';

import type { ComponentInterface, ComponentMeta } from 'core/component/interface';
import type { InitBeforeCreateStateOptions } from 'core/component/init/interface';

/**
 * Initializes the "beforeCreate" state to the specified component instance
 *
 * @param component
 * @param meta - the component meta object
 * @param [opts] - additional options
 */
export function beforeCreateState(
	component: ComponentInterface,
	meta: ComponentMeta,
	opts?: InitBeforeCreateStateOptions
): void {
	meta = forkMeta(meta);

	// To avoid TS errors marks all properties as editable
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(component);

	unsafe.unsafe = unsafe;
	unsafe.meta = meta;

	unsafe.componentName = meta.componentName;
	unsafe.instance = Object.cast(meta.instance);

	unsafe.$fields = {};
	unsafe.$systemFields = {};
	unsafe.$modifiedFields = {};
	unsafe.$refHandlers = {};

	unsafe.async = new Async(component);
	unsafe.$async = new Async(component);

	const
		root = unsafe.$root,
		parent = unsafe.$parent;

	const
		isFunctional = meta.params.functional === true;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (parent != null && parent.componentName == null) {
		Object.defineProperty(unsafe, '$root', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: root.unsafe
		});

		Object.defineProperty(unsafe, '$parent', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: root.$remoteParent
		});
	}

	unsafe.$normalParent = getNormalParent(component);

	for (let keys = ['$root', '$parent', '$normalParent'], i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = unsafe[key];

		if (val != null) {
			Object.defineProperty(unsafe, key, {
				configurable: true,
				enumerable: true,
				writable: false,
				value: getComponentContext(Object.cast(val))
			});
		}
	}

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventEmitterAPI(component);
	}

	attachAccessorsFromMeta(component);
	runHook('beforeRuntime', component).catch(stderr);

	const {
		systemFields,
		tiedFields,

		computedFields,
		accessors,

		watchDependencies,
		watchers
	} = meta;

	initFields(systemFields, component, unsafe);

	const
		fakeHandler = () => undefined;

	if (watchDependencies.size > 0) {
		const
			watchSet = new Set<PropertyInfo>();

		for (let o = watchDependencies.values(), el = o.next(); !el.done; el = o.next()) {
			const
				deps = el.value;

			for (let i = 0; i < deps.length; i++) {
				const
					dep = deps[i],
					info = getPropertyInfo(Object.isArray(dep) ? dep.join('.') : String(dep), component);

				if (info.type === 'system' || isFunctional && info.type === 'field') {
					watchSet.add(info);
				}
			}
		}

		// If a computed property has a field or system field as a dependency
		// and the host component does not have any watchers to this field,
		// we need to register the "fake" watcher to force watching
		if (watchSet.size > 0) {
			for (let o = watchSet.values(), el = o.next(); !el.done; el = o.next()) {
				const
					info = el.value;

				const needToForceWatching =
					watchers[info.name] == null &&
					watchers[info.originalPath] == null &&
					watchers[info.path] == null;

				if (needToForceWatching) {
					watchers[info.name] = [
						{
							deep: true,
							immediate: true,
							provideArgs: false,
							handler: fakeHandler
						}
					];
				}
			}
		}
	}

	// If a computed property is tied with a field or system field
	// and the host component does not have any watchers to this field,
	// we need to register the "fake" watcher to force watching
	for (let keys = Object.keys(tiedFields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			normalizedKey = tiedFields[key];

		if (normalizedKey == null) {
			continue;
		}

		const needToForceWatching = watchers[key] == null && (
			accessors[normalizedKey] != null ||
			computedFields[normalizedKey] != null
		);

		if (needToForceWatching) {
			watchers[key] = [
				{
					deep: true,
					immediate: true,
					provideArgs: false,
					handler: fakeHandler
				}
			];
		}
	}

	runHook('beforeCreate', component).catch(stderr);
	callMethodFromComponent(component, 'beforeCreate');
}
