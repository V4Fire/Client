/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchObject } from 'core/component/interface/watch';
import { PropOptions, RenderFunction, ModsDecl } from 'core/component/interface/other';

import {

	ComponentParams,
	ComponentProp,
	ComponentField,
	ComponentComputedField,
	ComponentAccessor,
	ComponentMethod,
	ComponentHooks,
	ComponentDirectiveOptions

} from 'core/component/create/meta/interface/types';

export * from 'core/component/create/meta/interface/types';

export interface ComponentMeta {
	name: string;
	componentName: string;

	constructor: Function;
	instance: Dictionary;

	params: ComponentParams;
	parentMeta?: ComponentMeta;

	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	systemFields: Dictionary<ComponentField>;
	mods: ModsDecl;

	computed: Dictionary<ComponentAccessor>;
	accessors: Dictionary<ComponentAccessor>;
	methods: Dictionary<ComponentMethod>;
	watchers: Dictionary<WatchObject[]>;
	hooks: ComponentHooks;

	component: {
		name: string;
		mods: Dictionary<string>;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComponentComputedField>;
		filters?: Dictionary<Function>;
		directives?: Dictionary<ComponentDirectiveOptions>;
		components?: Dictionary<ComponentMeta['component']>;
		staticRenderFns: RenderFunction[];
		render: RenderFunction;
	}
}
