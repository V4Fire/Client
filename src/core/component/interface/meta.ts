/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentParams } from 'core/component/interface/component';
import { Hooks } from 'core/component/interface/types';

export interface ComponentMeta {
	name: string;
	componentName: string;

	parentMeta?: ComponentMeta;
	constructor: Function;
	instance: Dictionary;
	params: ComponentParams;

	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	systemFields: Dictionary<ComponentField>;
	mods: ModsDecl;

	computed: Dictionary<ComponentAccessor>;
	accessors: Dictionary<ComponentAccessor>;
	methods: Dictionary<ComponentMethod>;
	watchers: Dictionary<WatchObject[]>;
	hooks: {[H in Hooks]: Hook[]};

	component: {
		name: string;
		mods: Dictionary<string>;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<unknown>>;
		filters?: Dictionary<Function>;
		directives?: Dictionary<DirectiveOptions>;
		components?: Dictionary<ComponentMeta['component']>;
		staticRenderFns: RenderFunction[];
		render: RenderFunction;
	}
}
