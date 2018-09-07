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
	ComputedOptions,
	ComponentOptions,
	FunctionalComponentOptions,
	CreateElement,
	RenderContext

} from 'vue';

// @ts-ignore
import * as defTpls from 'core/block.ss';
import { InjectOptions } from 'vue/types/options';
import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';

import 'core/component/filters';
import 'core/component/directives';

import log from 'core/log';
import inheritMeta, { PARENT } from 'core/component/inherit';

import VueInterface from 'core/component/vue';
import { getComponent, getBaseComponent } from 'core/component/component';
import { convertRender, createFakeCtx, patchVNode } from 'core/component/functional';

export * from 'core/component/decorators';
export * from 'core/component/functional';

export { PARENT } from 'core/component/inherit';
export { runHook } from 'core/component/component';
export { default as VueInterface, VueElement } from 'core/component/vue';
export { default as globalEvent, reset, ResetType } from 'core/component/event';

export const
	initEvent = new EventEmitter({maxListeners: 1e3}),
	rootComponents = Object.createDict(),
	localComponents = new WeakMap(),
	components = new WeakMap();

((initEventOnce) => {
	initEvent.once = function (event: string | string[], listener: Listener): EventEmitter {
		const
			events = (<string[]>[]).concat(event);

		for (let i = 0; i < events.length; i++) {
			const
				el = events[i];

			if (el === 'constructor') {
				initEventOnce(el, (obj) => {
					listener(obj);

					if (!Object.isBoolean(obj.meta.params.functional)) {
						initEventOnce(el, listener);
					}
				});

			} else {
				initEventOnce(el, listener);
			}
		}

		return this;
	};
})(initEvent.once.bind(initEvent));

export interface ComponentParams {
	name?: string;
	root?: boolean;
	tpl?: boolean;
	functional?: boolean | Dictionary;
	tiny?: boolean;
	model?: {prop?: string; event?: string};
	parent?: Vue;
	provide?: Dictionary | (() => Dictionary);
	inject?: InjectOptions;
	inheritAttrs?: boolean;
}

export interface FieldWatcher extends WatchOptions {
	fn: WatchHandler<any>;
	provideArgs?: boolean;
}

export interface ComponentProp extends PropOptions {
	watchers: Map<string | Function, FieldWatcher>;
	default?: any;
}

export interface InitFieldFn<T extends VueInterface = VueInterface> {
	(ctx: T, data: Dictionary): any;
}

export interface MergeFieldFn<T extends VueInterface = VueInterface> {
	(ctx: T, oldCtx: T, field: string, link: string | undefined): any;
}

export interface UniqueFieldFn<T extends VueInterface = VueInterface> {
	(ctx: T, oldCtx: T): any;
}

export interface SystemField<T extends VueInterface = VueInterface> {
	atom?: boolean;
	default?: any;
	unique?: boolean | UniqueFieldFn<T>;
	after: Set<string>;
	init?: InitFieldFn<T>;
	merge?: InitFieldFn<T>;
}

export interface ComponentField<T extends VueInterface = VueInterface> extends SystemField<T> {
	watchers: Map<string | Function, FieldWatcher>;
}

export interface SystemField<T extends VueInterface = VueInterface> {
	default?: any;
	init?: InitFieldFn<T>;
}

export interface WatchOptionsWithHandler<T extends VueInterface = VueInterface, A = any, B = A> extends WatchOptions {
	event?: boolean;
	group?: string;
	method?: string;
	provideArgs?: boolean;
	handler(a: A, b: B): any;
	handler(...args: A[]): any;
	handler(ctx: T, a: A, b: B): any;
	handler(ctx: T, ...args: A[]): any;
}

export interface MethodWatcher extends WatchOptions {
	event?: string;
	field?: string;
	group?: string;
	provideArgs?: boolean;
}

export type Hooks =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
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
	[name: string]: Array<ModVal | ModVal[] | typeof PARENT> | void;
}

export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}

export interface ComponentMeta {
	name: string;
	componentName: string;
	constructor: Function,
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
		mods: Dictionary<string | undefined>;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<any>>;
		render: ComponentOptions<Vue>['render'] | FunctionalComponentOptions['render'];
		ctx?: FunctionalCtx;
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
 *   *) [name] - component name
 *   *) [root] - if true, then the component will be registered as root
 *   *) [tpl] - if false, then will be used the default template
 *   *) [functional] - functional status:
 *        *) if true, then the component will be created as functional
 *        *) if a table with parameters, then the component will be created as smart component
 *
 *   *) [tiny] - if true, then the functional component will be created without advanced component shim
 *   *) [parent] - link to a parent component
 *   *) [model] - parameters for Vue.model
 *   *) [provide] - parameters for Vue.provide
 *   *) [inject] - parameters for Vue.inject
 *   *) [inheritAttrs] - parameters for Vue.inheritAttrs
 */
export function component(params?: ComponentParams): Function {
	return (target) => {
		const
			name = params && params.name || getComponentName(target),
			parent = Object.getPrototypeOf(target),
			parentMeta = components.get(parent),
			isSmart = /-functional$/;

		let p: ComponentParams = parentMeta ? {...params} : {
			root: false,
			tpl: true,
			functional: false,
			inheritAttrs: true,
			...params
		};

		const
			mods = {};

		if (target.mods) {
			for (let o = target.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const key = keys[i];
				mods[key.camelize(false)] = o[key];
			}
		}

		const meta: ComponentMeta = {
			name,
			componentName: name.replace(isSmart, ''),
			constructor: target,
			params: p,

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
				mods: {},
				props: {},
				methods: {},
				computed: {},
				render(el: CreateElement, baseCtx: RenderContext): any {
					const
						{methods: {render: r}, component: {ctx}} = meta;

					if (r) {
						if (p.functional === true && ctx) {
							const fakeCtx = createFakeCtx(el, baseCtx, ctx);
							return patchVNode(r.fn.call(fakeCtx, el, baseCtx), fakeCtx, baseCtx);
						}

						return r.fn.call(this, el);
					}
				}
			}
		};

		if (parentMeta) {
			p = inheritMeta(meta, parentMeta);
		}

		if (!p.name || !isSmart.test(p.name)) {
			components.set(target, meta);
		}

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

				log(`component:load:${name}`, component);
				resolve(component);
			};

			const addRenderAndResolve = (tpls) => {
				const
					fns = tpls.index();

				if (p.functional === true) {
					component.render = convertRender(fns, <any>meta.component.ctx);

				} else {
					Object.assign(component, fns);
				}

				success();
			};

			const
				r = meta.component.methods.render;

			if (p.tpl === false) {
				if (r) {
					success();

				} else {
					addRenderAndResolve(defTpls.block);
				}

			} else {
				const f = () => {
					const
						fns = TPLS[meta.componentName];

					if (fns) {
						if (r) {
							success();

						} else {
							addRenderAndResolve(fns);
						}

					} else {
						setImmediate(f);
					}
				};

				f();
			}
		};

		const
			obj = loadTemplate(getComponent(target, meta));

		if (p.root) {
			rootComponents[name] = new Promise(obj);

		} else {
			Vue.component(name, obj);
		}

		if (!Object.isBoolean(<any>p.functional)) {
			component({
				...params,
				name: `${name}-functional`,
				functional: true
			})(target);
		}
	};
}
