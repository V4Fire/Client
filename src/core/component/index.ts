/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, {

	PropOptions,
	WatchOptions,
	WatchHandler,
	WatchOptionsWithHandler,
	ComputedOptions

} from 'vue';

import inheritMeta from 'core/component/inherit';
import { getComponent } from 'core/component/component';
import { InjectOptions } from 'vue/types/options';
import { EventEmitter2 } from 'eventemitter2';

export * from 'core/component/decorators';
export { PARENT } from 'core/component/inherit';
export { default as VueInterface, VueElement } from 'core/component/vue';

export const
	initEvent = new EventEmitter2({maxListeners: 1e3}),
	rootComponents = {},
	components = new WeakMap();

export interface ComponentParams {
	root?: boolean;
	tpl?: boolean;
	functional?: false;
	mixins?: Dictionary;
	model?: {prop?: string; event?: string};
	parent?: Vue;
	provide?: Dictionary | (() => Dictionary);
	inject?: InjectOptions;
	inheritAttrs?: boolean;
}

export interface FieldWatcher extends WatchOptions {
	fn: WatchHandler<any>;
}

export interface ComponentProp extends PropOptions {
	watchers: Map<string | Function, FieldWatcher>;
}

export interface InitFieldFn {
	(ctx: any): any;
}

export interface ComponentField {
	watchers: Map<string | Function, FieldWatcher>;
	default?: any;
	init?: InitFieldFn;
}

export interface SystemField {
	default?: any;
	init?: InitFieldFn;
}

export interface MethodWatcher extends WatchOptions {
	field: string;
}

export type Hooks =
	'beforeCreate' |
	'created' |
	'beforeMount' |
	'mounted' |
	'beforeUpdate' |
	'updated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'errorCaptured';

export interface ComponentMethod {
	fn: Function;
	watchers: Dictionary<MethodWatcher>;
	hooks: {[hook in Hooks]?: {
		name: string;
		hook: string;
		after: Set<string>;
	}};
}

export type ModVal = string | boolean | number;
export interface ModsDecl {
	[name: string]: Array<ModVal | ModVal[]> | void;
}

export interface ComponentMeta {
	name: string;
	params: ComponentParams;
	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	systemFields: Dictionary<ComponentField>;
	mods: ModsDecl;
	computed: Dictionary<ComputedOptions<any>>;
	accessors: Dictionary<ComputedOptions<any>>;
	methods: Dictionary<ComponentMethod>;
	watchers: Dictionary<WatchOptionsWithHandler<any>[]>;
	hooks: {[hook in Hooks]: Array<{
		name?: string;
		fn: Function;
		after?: Set<string>;
	}>};

	component: {
		name: string;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<any>>;
	}
}

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

/**
 * Creates new Vue.js component
 *
 * @decorator
 * @param [params] - additional parameters:
 *   *) [root] - if true, then the component will be registered as root
 *   *) [functional] - if true, then the component will be created as functional
 *   *) [tpl] - if false, then will be used the default template
 */
export function component(params: ComponentParams = {}): Function {
	let p: ComponentParams = {
		root: false,
		tpl: true,
		functional: false,
		inheritAttrs: false,
		mixins: {},
		...params
	};

	return (target) => {
		const
			name = getComponentName(target),
			parent = Object.getPrototypeOf(target),
			parentMeta = components.get(parent);

		const meta: ComponentMeta = {
			name,
			params: p,
			props: {},
			fields: {},
			systemFields: {},
			mods: target.mods || {},
			computed: {},
			accessors: {},
			methods: {},
			watchers: {},
			hooks: {
				beforeCreate: [],
				created: [],
				beforeMount: [],
				mounted: [],
				beforeUpdate: [],
				updated: [],
				activated: [],
				deactivated: [],
				beforeDestroy: [],
				destroyed: [],
				errorCaptured: []
			},
			component: {
				name,
				props: {},
				methods: {},
				computed: {}
			}
		};

		if (parentMeta) {
			p = inheritMeta(meta, parentMeta);
		}

		components.set(target, meta);
		initEvent.emit('constructor', {meta, parentMeta});

		let component;
		if (p.functional) {

		} else {
			Vue.component(name, getComponent(target, meta));
		}

		if (p.root) {
			// rootComponents[name];
		}
	};
}
