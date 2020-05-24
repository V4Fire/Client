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

import Async from 'core/async';
import { deprecate } from 'core/functools/deprecation';

import { unmute } from 'core/object/watch';
import { asyncLabel } from 'core/component/const';
import { storeRgxp } from 'core/component/reflection';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { implementEventAPI } from 'core/component/event';
import { bindRemoteWatchers, implementComponentWatchAPI } from 'core/component/watch';

import { runHook } from 'core/component/hook';
import { resolveRefs } from 'core/component/ref';

import { getNormalParent } from 'core/component/traverse';
import { forkMeta } from 'core/component/meta';

import { ComponentInterface, ComponentMeta } from 'core/component/interface';
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

	Object.assign(component, {
		meta,
		unsafe: component,
		componentName: meta.componentName,
		instance: meta.instance,

		$fields: {},
		$systemFields: {},
		$refHandlers: {},
		$modifiedFields: {},
		$async: new Async(component),
		$asyncLabel: asyncLabel
	});

	const
		{unsafe, unsafe: {$parent: parent}} = component;

	if (parent && !parent.componentName) {
		unsafe.$parent = unsafe.$root.unsafe.$remoteParent;
	}

	unsafe.$normalParent = getNormalParent(component);

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventAPI(component);
	}

	attachAccessorsFromMeta(component, opts?.safe);
	runHook('beforeRuntime', component).catch(stderr);

	const
		{systemFields, computedFields, accessors, watchDependencies, watchers} = meta,
		{$systemFields} = unsafe;

	initFields(systemFields, component, unsafe);

	let
		watchMap;

	if (watchDependencies.size) {
		watchMap = Object.createDict();

		for (let o = watchDependencies.values(), el = o.next(); !el.done; el = o.next()) {
			const
				val = el.value,
				key = <string>(Object.isArray(val) ? val[0] : val);

			if (systemFields[key]) {
				watchMap[key] = true;
			}
		}
	}

	const
		fakeHandler = () => undefined;

	// Tie system fields with a component
	for (let keys = Object.keys(systemFields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			normalizedKey = key.replace(storeRgxp, '');

		$systemFields[key] = component[key];

		// If a computed property is tied with a system field
		// and the host component doesn't have any watchers to this field,
		// we need to register the "fake" watcher to force watching for system fields
		const needToForceWatching = !watchers[key] && (
			watchMap?.[key] ||
			storeRgxp.test(key) && (computedFields[normalizedKey] || accessors[normalizedKey])
		);

		if (needToForceWatching) {
			watchers[key] = [{
				deep: true,
				immediate: true,
				provideArgs: false,
				handler: fakeHandler
			}];
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
	const
		{unsafe} = component;

	unmute(unsafe.$fields);
	unmute(unsafe.$systemFields);

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}, stderr);
}

/**
 * Initializes "beforeMount" state to the specified component instance
 * @param component
 */
export function beforeMountState(component: ComponentInterface): void {
	runHook('beforeMount', component).catch(stderr);
	callMethodFromComponent(component, 'beforeMount');
}

/**
 * Initializes "mounted" state to the specified component instance
 * @param component
 */
export function mountedState(component: ComponentInterface): void {
	component.$el.component = component;
	runHook('beforeMounted', component).catch(stderr);
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
}

/**
 * Initializes "deactivated" state to the specified component instance
 * @param component
 */
export function deactivatedState(component: ComponentInterface): void {
	runHook('deactivated', component).catch(stderr);
	callMethodFromComponent(component, 'deactivated');
}

/**
 * Initializes "beforeDestroy" state to the specified component instance
 * @param component
 */
export function beforeDestroyState(component: ComponentInterface): void {
	const {$async} = component.unsafe;
	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');
	$async.clearAll().locked = true;
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
