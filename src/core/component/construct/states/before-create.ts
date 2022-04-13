/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import { asyncLabel } from 'core/component/const';
import { getComponentContext } from 'core/component/engines/helpers';

import { forkMeta } from 'core/component/meta';
import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { getNormalParent } from 'core/component/traverse';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { runHook } from 'core/component/hook';
import { implementEventAPI } from 'core/component/event';

import type { ComponentInterface, ComponentMeta } from 'core/component/interface';
import type { InitBeforeCreateStateOptions } from 'core/component/construct/interface';

/**
 * Initializes the "beforeCreate" state to the specified component instance
 *
 * @param component
 * @param meta - component meta object
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

	unsafe.$async = new Async(component);
	unsafe.$asyncLabel = asyncLabel;

	const
		parent = unsafe.$parent,
		isFunctional = meta.params.functional === true;

	if (parent != null && parent.componentName == null) {
		unsafe.$parent = unsafe.$root.unsafe.$remoteParent;
	}

	unsafe.$normalParent = getNormalParent(component);

	for (let keys = ['$root', '$parent', '$normalParent'], i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = unsafe[key];

		if (val != null) {
			unsafe[key] = getComponentContext(Object.cast(val));
		}
	}

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventAPI(component);
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
