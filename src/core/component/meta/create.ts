/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defaultWrapper } from 'core/component/const';

import { getComponentMods, isAbstractComponent } from 'core/component/reflection';
import { isTypeCanBeFunc } from 'core/component/prop';
import { wrapRender } from 'core/component/render-function';

import { inherit } from 'core/component/meta/inherit';
import { addMethodsToMeta } from 'core/component/meta/method';

import {

	ComponentMeta,
	ComponentConstructor,
	ComponentConstructorInfo,

	ComponentProp,
	ComponentField,
	WatchObject,

	RenderFunction

} from 'core/component/interface';

/**
 * Creates a meta object for the specified component and returns it
 * @param component - component constructor info
 */
export function createMeta(component: ComponentConstructorInfo): ComponentMeta {
	const meta = {
		name: component.name,
		componentName: component.componentName,

		parentMeta: component.parentMeta,
		constructor: component.constructor,
		instance: {},
		params: component.params,

		props: {},
		mods: getComponentMods(component),

		fields: {},
		tiedFields: {},
		computedFields: {},
		systemFields: {},
		tiedSystemFields: {},

		accessors: {},
		methods: {},
		watchers: {},
		watchDependencies: new Map(),

		hooks: {
			beforeRuntime: [],
			beforeCreate: [],
			beforeDataCreate: [],
			created: [],
			beforeMount: [],
			beforeMounted: [],
			mounted: [],
			beforeUpdate: [],
			beforeUpdated: [],
			updated: [],
			beforeActivated: [],
			activated: [],
			deactivated: [],
			beforeDestroy: [],
			destroyed: [],
			errorCaptured: []
		},

		component: {
			name: component.name,
			mods: {},
			props: {},
			methods: {},
			staticRenderFns: [],
			render: <RenderFunction>(() => {
				throw new ReferenceError(`A render function for the component "${component.componentName}" is not specified`);
			})
		}
	};

	meta.component.render = wrapRender(meta);

	if (component.parentMeta) {
		inherit(meta, component.parentMeta);
	}

	return meta;
}

/**
 * Fills a meta object with methods and properties from the specified component class
 *
 * @param meta
 * @param [constructor] - component constructor
 */
export function fillMeta(
	meta: ComponentMeta,
	constructor: ComponentConstructor<any> = meta.constructor
): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	const
		{component, methods, watchers, hooks} = meta;

	const instance = new constructor();
	meta.instance = instance;

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	const
		isFunctional = meta.params.functional === true;

	// Methods

	for (let o = methods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			nm = keys[i],
			method = o[nm];

		if (!method) {
			continue;
		}

		component.methods[nm] = method.fn;

		if (method.watchers) {
			for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = <NonNullable<WatchObject>>o[key];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				const
					watcherListeners = watchers[key] ?? [];

				watchers[key] = watcherListeners;
				watcherListeners.push({
					...watcher,
					method: nm,
					args: Array.concat([], watcher.args),
					handler: <any>method.fn
				});
			}
		}

		// Hooks

		if (method.hooks) {
			for (let o = method.hooks, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = o[key];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				hooks[key].push({...watcher, fn: method.fn});
			}
		}
	}

	// Props

	const
		defaultProps = meta.params.defaultProps !== false;

	for (let o = meta.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			prop = <NonNullable<ComponentProp>>o[key];

		let
			def,
			defWrapper,
			skipDefault = true;

		if (defaultProps || prop.forceDefault) {
			skipDefault = false;
			def = instance[key];
			defWrapper = def;

			if (def != null && typeof def === 'object' && (!isTypeCanBeFunc(prop.type) || !Object.isFunction(def))) {
				defWrapper = () => Object.fastClone(def);
				defWrapper[defaultWrapper] = true;
			}
		}

		let
			defValue;

		if (!skipDefault) {
			defValue = prop.default !== undefined ? prop.default : defWrapper;
		}

		component.props[key] = {
			type: prop.type,
			required: prop.required !== false && defaultProps && defValue === undefined,

			// eslint-disable-next-line @typescript-eslint/unbound-method
			validator: prop.validator,
			functional: prop.functional,
			default: defValue
		};

		if (Object.size(prop.watchers) > 0) {
			const watcherListeners = watchers[key] ?? [];
			watchers[key] = watcherListeners;

			for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value;

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				watcherListeners.push(watcher);
			}
		}
	}

	// Fields

	for (let fields = [meta.systemFields, meta.fields], i = 0; i < fields.length; i++) {
		for (let o = fields[i], keys = Object.keys(o), j = 0; j < keys.length; j++) {
			const
				key = keys[j],
				field = <NonNullable<ComponentField>>o[key];

			if (field.watchers) {
				for (let w = field.watchers.values(), el = w.next(); !el.done; el = w.next()) {
					const
						watcher = el.value;

					if (isFunctional && watcher.functional === false) {
						continue;
					}

					const
						watcherListeners = watchers[key] ?? [];

					watchers[key] = watcherListeners;
					watcherListeners.push(watcher);
				}
			}
		}
	}

	// Modifiers

	const
		{mods} = component;

	for (let o = meta.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mod = o[key];

		let
			def;

		if (mod) {
			for (let i = 0; i < mod.length; i++) {
				const
					el = mod[i];

				if (Object.isArray(el)) {
					def = el;
					break;
				}
			}

			mods[key] = def !== undefined ? String(def[0]) : undefined;
		}
	}

	return meta;
}
