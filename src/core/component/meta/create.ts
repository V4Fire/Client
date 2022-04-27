/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentMods } from 'core/component/reflect';
import { getComponentContext } from 'core/component/context';
import { inheritMeta } from 'core/component/meta/inherit';

import type { ComponentMeta, ComponentConstructorInfo } from 'core/component/interface';

/**
 * Creates a meta object for the specified component and returns it
 * @param component - component constructor info
 */
export function createMeta(component: ComponentConstructorInfo): ComponentMeta {
	const meta: ComponentMeta = {
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
		systemFields: {},
		computedFields: {},

		methods: {},
		accessors: {},
		watchers: {},

		watchDependencies: new Map(),
		watchPropDependencies: new Map(),

		hooks: {
			beforeRuntime: [],
			beforeCreate: [],
			beforeDataCreate: [],
			created: [],
			beforeMount: [],
			mounted: [],
			beforeUpdate: [],
			beforeUpdated: [],
			updated: [],
			beforeActivated: [],
			activated: [],
			deactivated: [],
			beforeDestroy: [],
			destroyed: [],
			renderTracked: [],
			renderTriggered: [],
			errorCaptured: []
		},

		component: {
			name: component.name,
			mods: {},
			props: {},
			methods: {},
			render: (() => {
				throw new ReferenceError(`A render function for the component "${component.componentName}" is not specified`);
			})
		}
	};

	const
		map = new WeakMap();

	meta.component.render = Object.cast((ctx, cache) => {
		const
			unsafe = getComponentContext(ctx);

		if (map.has(ctx)) {
			return map.get(ctx)();
		}

		const
			fn = meta.methods.render!.fn(unsafe, cache);

		map.set(ctx, fn);
		return fn();
	});

	if (component.parentMeta) {
		inheritMeta(meta, component.parentMeta);
	}

	return meta;
}
