/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentMeta, ComponentConstructorInfo } from 'core/component/interface';

export function getBlankMetaForComponent(component: ComponentConstructorInfo): ComponentMeta {
	return {
		name: component.name,
		componentName: component.componentName,

		parentMet: component.parentMeta,
		constructor: component.constructor,
		instance: {},
		params: component.params,

		props: {},
		fields: {},
		systemFields: {},
		mods,

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
			name: i.name,
			mods: {},
			props: {},
			methods: {},
			computed: {},
			staticRenderFns: [],
			render() {
			}
		}
	};
}
