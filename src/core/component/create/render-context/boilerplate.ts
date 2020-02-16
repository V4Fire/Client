/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentMods } from 'core/component/reflection';
import { ComponentMeta, ComponentConstructorInfo } from 'core/component/interface';

/**
 * Creates a blank meta object for the specified component and returns it
 * @param component
 */
export function getBlankMetaForComponent(component: ComponentConstructorInfo): ComponentMeta {
	return {
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
			render(): never {
				throw new ReferenceError(`A render function for the component "${component.componentName}" is not specified`);
			}
		}
	};
}
