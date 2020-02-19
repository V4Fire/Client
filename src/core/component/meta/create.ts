/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentMods } from 'core/component/reflection';
import { inherit } from 'core/component/meta/inherit';
import { wrapRender } from 'core/component/create/render-function';
import { ComponentMeta, ComponentConstructorInfo, RenderFunction } from 'core/component/interface';

/**
 * Creates a meta object for the specified component and returns it
 * @param component - component constructor info
 */
export function createComponentMeta(component: ComponentConstructorInfo): ComponentMeta {
	const meta = {
		name: component.name,
		componentName: component.componentName,

		parentMeta: component.parentMeta,
		constructor: component.constructor,
		instance: {},
		params: component.params,

		props: {},
		fields: {},
		systemFields: {},
		mods: getComponentMods(component),

		computed: {},
		accessors: {},
		methods: {},
		watchers: {},

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
			computed: {},
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
