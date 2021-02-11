/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/construct/README.md]]
 * @packageDocumentation
 */

import { deprecate } from 'core/functools/deprecation';
import { unmute } from 'core/object/watch';

import Async from 'core/async';

import { asyncLabel } from 'core/component/const';
import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { implementEventAPI } from 'core/component/event';
import { bindRemoteWatchers, implementComponentWatchAPI } from 'core/component/watch';

import { runHook } from 'core/component/hook';
import { resolveRefs } from 'core/component/ref';

import { getNormalParent } from 'core/component/traverse';
import { forkMeta } from 'core/component/meta';

import { ComponentInterface, ComponentMeta, ActivationStatus } from 'core/component/interface';
import { InitBeforeCreateStateOptions, InitBeforeDataCreateStateOptions } from 'core/component/construct/interface';

export * from 'core/component/construct/interface';

/**
 * Initializes "beforeCreate" state to the specified component instance
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

	// @ts-ignore (access)
	component.unsafe = component;

	// @ts-ignore (access)
	component.meta = meta;

	// @ts-ignore (access)
	component['componentName'] = meta.componentName;

	// @ts-ignore (access)
	component['instance'] = meta.instance;

	// @ts-ignore (access)
	component.$fields = {};

	// @ts-ignore (access)
	component.$systemFields = {};

	// @ts-ignore (access)
	component.$refHandlers = {};

	// @ts-ignore (access)
	component.$modifiedFields = {};

	// @ts-ignore (access)
	component.$async = new Async(component);

	// @ts-ignore (access)
	component.$asyncLabel = asyncLabel;

	const
		{unsafe, unsafe: {$parent: parent}} = component;

	const
		isFunctional = meta.params.functional === true;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (parent != null && parent.componentName == null) {
		// @ts-ignore (access)
		unsafe['$parent'] = unsafe.$root.unsafe.$remoteParent;
	}

	// @ts-ignore (access)
	unsafe['$normalParent'] = getNormalParent(component);

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

		// If a computed property a field or system field as a dependency,
		// and the host component doesn't have any watchers to this field,
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
	// and the host component doesn't have any watchers to this field,
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

/**
 * Initializes "beforeDataCreate" state to the specified component instance
 *
 * @param component
 * @param [opts] - additional options
 */
export function beforeDataCreateState(
	component: ComponentInterface,
	opts?: InitBeforeDataCreateStateOptions
): void {
	const {meta, $fields} = component.unsafe;
	initFields(meta.fields, component, $fields);

	// Because in functional components,
	// the watching of fields can be initialized in a lazy mode
	if (meta.params.functional === true) {
		Object.assign(component, $fields);
	}

	Object.defineProperty(component, '$$data', {
		get(): typeof $fields {
			deprecate({name: '$$data', type: 'property', renamedTo: '$fields'});
			return $fields;
		}
	});

	runHook('beforeDataCreate', component).catch(stderr);
	implementComponentWatchAPI(component, {tieFields: opts?.tieFields});
	bindRemoteWatchers(component);
}

/**
 * Initializes "created" state to the specified component instance
 * @param component
 */
export function createdState(component: ComponentInterface): void {
	const {
		unsafe,
		unsafe: {$root: r}
	} = component;

	unmute(unsafe.$fields);
	unmute(unsafe.$systemFields);

	const
		isRegular = unsafe.meta.params.functional !== true && !unsafe.isFlyweight;

	if (isRegular && '$remoteParent' in r) {
		const cb = (status: ActivationStatus) => {
			runHook(status, component).then(() => {
				callMethodFromComponent(component, status);
			}, stderr);
		};

		r.unsafe.$on('app-activation', cb);
		unsafe.$async.worker(() => r.unsafe.$off('app-activation', cb));
	}

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}, stderr);
}

/**
 * Initializes "beforeMount" state to the specified component instance
 * @param component
 */
export function beforeMountState(component: ComponentInterface): void {
	const
		{$el} = component;

	if ($el != null) {
		$el.component = component;
	}

	if (!component.isFlyweight) {
		runHook('beforeMount', component).catch(stderr);
		callMethodFromComponent(component, 'beforeMount');
	}
}

/**
 * Initializes "mounted" state to the specified component instance
 * @param component
 */
export function mountedState(component: ComponentInterface): void {
	const
		{$el} = component;

	if ($el != null && $el.component !== component) {
		$el.component = component;
	}

	resolveRefs(component);

	runHook('mounted', component).then(() => {
		callMethodFromComponent(component, 'mounted');
	}, stderr);
}

/**
 * Initializes "beforeUpdate" state to the specified component instance
 * @param component
 */
export function beforeUpdateState(component: ComponentInterface): void {
	runHook('beforeUpdate', component).catch(stderr);
	callMethodFromComponent(component, 'beforeUpdate');
}

/**
 * Initializes "updated" state to the specified component instance
 * @param component
 */
export function updatedState(component: ComponentInterface): void {
	runHook('beforeUpdated', component).catch(stderr);
	resolveRefs(component);

	runHook('updated', component).then(() => {
		callMethodFromComponent(component, 'updated');
	}, stderr);
}

/**
 * Initializes "activated" state to the specified component instance
 * @param component
 */
export function activatedState(component: ComponentInterface): void {
	runHook('beforeActivated', component).catch(stderr);
	resolveRefs(component);

	runHook('activated', component).catch(stderr);
	callMethodFromComponent(component, 'activated');
	void component.emitActivation('activated');
}

/**
 * Initializes "deactivated" state to the specified component instance
 * @param component
 */
export function deactivatedState(component: ComponentInterface): void {
	runHook('deactivated', component).catch(stderr);
	callMethodFromComponent(component, 'deactivated');
	void component.emitActivation('deactivated');
}

/**
 * Initializes "beforeDestroy" state to the specified component instance
 * @param component
 */
export function beforeDestroyState(component: ComponentInterface): void {
	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');
	component.unsafe.$async.clearAll().locked = true;
}

/**
 * Initializes "destroyed" state to the specified component instance
 * @param component
 */
export function destroyedState(component: ComponentInterface): void {
	runHook('destroyed', component).then(() => {
		callMethodFromComponent(component, 'destroyed');
	}, stderr);
}

/**
 * Initializes "errorCaptured" state to the specified component instance
 *
 * @param component
 * @param args - additional arguments
 */
export function errorCapturedState(component: ComponentInterface, ...args: unknown[]): void {
	runHook('errorCaptured', component, ...args).then(() => {
		callMethodFromComponent(component, 'errorCaptured', ...args);
	}, stderr);
}
