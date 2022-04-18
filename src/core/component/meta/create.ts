/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { inheritMeta } from 'core/component/meta/inherit';
import { getComponentMods } from 'core/component/reflect';
import { wrapRender } from 'core/component/render-function';

import type { RenderFunction } from 'core/component/engines';
import type { ComponentMeta, ComponentConstructorInfo } from 'core/component/interface';

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
			staticRenderFns: [],
			render: <RenderFunction>(() => {
				throw new ReferenceError(`A render function for the component "${component.componentName}" is not specified`);
			})
		}
	};

	meta.component.render = wrapRender(meta);

	if (component.parentMeta) {
		inheritMeta(meta, component.parentMeta);
	}

	return meta;
}
