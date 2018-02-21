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
	ComputedOptions

} from 'vue';

// @ts-ignore
import * as defTpls from 'core/block.ss';
import inheritMeta from 'core/component/inherit';
import VueInterface from 'core/component/vue';

import { getComponent, getBaseComponent } from 'core/component/component';
import { InjectOptions } from 'vue/types/options';
import { EventEmitter2 } from 'eventemitter2';

export * from 'core/component/decorators';
export { PARENT } from 'core/component/inherit';
export { default as VueInterface, VueElement } from 'core/component/vue';

export const
	initEvent = new EventEmitter2({maxListeners: 1e3}),
	rootComponents = Object.createDict(),
	localComponents = new WeakMap(),
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

export interface InitFieldFn<T extends VueInterface = VueInterface> {
	(ctx: T): any;
}

export interface ComponentField<T extends VueInterface = VueInterface> {
	default?: any;
	watchers: Map<string | Function, FieldWatcher>;
	init?: InitFieldFn<T>;
}

export interface SystemField<T extends VueInterface = VueInterface> {
	default?: any;
	init?: InitFieldFn<T>;
}

export interface WatchOptionsWithHandler<T extends VueInterface = VueInterface, A = any, B = A> extends WatchOptions {
	method?: true;
	handler(a: A, b: B): any;
	handler(ctx: T, a: A, b: B): any;
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
	watchers: Dictionary<WatchOptionsWithHandler[]>;
	hooks: {[hook in Hooks]: Array<{
		fn: Function;
		name?: string;
		after?: Set<string>;
	}>};

	component: {
		name: string;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<any>>;
	}
}

export const
	isAbstractComponent = /^[iv]-/;

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

		if (isAbstractComponent.test(name)) {
			getBaseComponent(target, meta);
			return;
		}

		const loadTemplate = (component) => (resolve) => {
			const success = () => {
				if (localComponents.has(target)) {
					// tslint:disable-next-line
					component.components = Object.assign(component.components || {}, localComponents.get(target));
				}

				resolve(component);
			};

			const addRenderAndResolve = (tpls) => {
				Object.assign(component, tpls.index());
				success();
			};

			if ('render' in component.methods) {
				success();

			} else if (p.tpl === false) {
				addRenderAndResolve(defTpls.block);

			} else {
				const f = () => {
					if (TPLS[name]) {
						addRenderAndResolve(TPLS[name]);

					} else {
						setImmediate(f);
					}
				};

				f();
			}
		};

		if (p.functional) {

		} else {
			const
				component = loadTemplate(getComponent(target, meta));

			if (p.root) {
				rootComponents[name] = new Promise(component);

			} else {
				Vue.component(name, component);
			}
		}
	};
}
