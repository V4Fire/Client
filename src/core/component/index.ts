/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-ignore
import * as defTpls from 'core/block.ss';

import log from 'core/log';
import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';

import {

	ComponentDriver,
	PropOptions,
	WatchOptions,
	ComputedOptions,
	ComponentOptions,
	InjectOptions,
	FunctionalComponentOptions,
	RenderContext,
	CreateElement,
	VNode

} from 'core/component/engines';

import 'core/component/filters';
import 'core/component/directives';

import inheritMeta, { PARENT } from 'core/component/inherit';
import ComponentInterface from 'core/component/interface';

import { getComponent, getBaseComponent } from 'core/component/component';
import { convertRender, createFakeCtx, patchVNode } from 'core/component/functional';

export * from 'core/component/decorators';
export * from 'core/component/functional';
export * from 'core/component/engines';
export { ComponentDriver as default } from 'core/component/engines';

export { PARENT } from 'core/component/inherit';
export { runHook, customWatcherRgxp } from 'core/component/component';
export { default as ComponentInterface, ComponentElement } from 'core/component/interface';
export { default as globalEvent, reset, ResetType } from 'core/component/event';

export const
	initEvent = new EventEmitter({maxListeners: 1e3}),
	rootComponents = Object.createDict<Promise<ComponentOptions<ComponentDriver>>>(),
	localComponents = new WeakMap(),
	components = new WeakMap();

((initEventOnce) => {
	initEvent.once = function (event: CanArray<string>, listener: Listener): EventEmitter {
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
	parent?: ComponentDriver;
	provide?: Dictionary | (() => Dictionary);
	inject?: InjectOptions;
	inheritAttrs?: boolean;
	inheritMods?: boolean;
	defaultProps?: boolean;
}

export interface WatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b: B): unknown;
	(...args: A[]): unknown;
	(ctx: CTX, a: A, b: B): unknown;
	(ctx: CTX, ...args: A[]): unknown;
}

export interface FieldWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: WatchHandler<CTX, A, B>;
	provideArgs?: boolean;
}

export interface ComponentProp extends PropOptions {
	watchers: Map<string | Function, FieldWatcher>;
	forceDefault?: boolean;
	default?: unknown;
}

export interface InitFieldFn<T extends ComponentInterface = ComponentInterface> {
	(ctx: T, data: Dictionary): unknown;
}

export interface MergeFieldFn<T extends ComponentInterface = ComponentInterface> {
	(ctx: T, oldCtx: T, field: string, link: CanUndef<string>): unknown;
}

export interface UniqueFieldFn<T extends ComponentInterface = ComponentInterface> {
	(ctx: T, oldCtx: T): unknown;
}

export interface SystemField<T extends ComponentInterface = ComponentInterface> {
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<T>;
	after: Set<string>;
	init?: InitFieldFn<T>;
	merge?: InitFieldFn<T>;
}

export interface ComponentField<T extends ComponentInterface = ComponentInterface> extends SystemField<T> {
	watchers: Map<string | Function, FieldWatcher>;
}

export interface SystemField<T extends ComponentInterface = ComponentInterface> {
	default?: unknown;
	init?: InitFieldFn<T>;
}

export interface WatchWrapper<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX, handler: WatchHandler<CTX, A, B>): CanPromise<WatchHandler<CTX, A, B> | Function>;
}

export interface WatchOptionsWithHandler<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	group?: string;
	single?: boolean;
	options?: AddEventListenerOptions;
	method?: string;
	args?: CanArray<unknown>;
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
	handler: string | WatchHandler<CTX, A, B>;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	field?: string;
	group?: string;
	single?: boolean;
	options?: AddEventListenerOptions;
	args?: CanArray<unknown>;
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
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

	parentMeta?: ComponentMeta;
	constructor: Function;
	params: ComponentParams;

	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	systemFields: Dictionary<ComponentField>;
	mods: ModsDecl;

	computed: Dictionary<ComputedOptions<unknown>>;
	accessors: Dictionary<ComputedOptions<unknown>>;
	methods: Dictionary<ComponentMethod>;
	watchers: Dictionary<WatchOptionsWithHandler[]>;

	hooks: {[hook in Hooks]: Array<{
		fn: Function;
		name?: string;
		after?: Set<string>;
	}>};

	component: {
		name: string;
		mods: Dictionary<string>;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<unknown>>;
		render: ComponentOptions<ComponentDriver>['render'] | FunctionalComponentOptions['render'];
		ctx?: FunctionalCtx;
	}
}

export const
	isAbstractComponent = /^[iv]-/,
	isSmartComponent = /-functional$/;

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

/**
 * Creates a new component
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
 *
 *   // Component driver options (by default Vue):
 *
 *   *) [model] - parameters for a model option
 *   *) [provide] - parameters for a provide option
 *   *) [inject] - parameters for an inject option
 *   *) [inheritAttrs] - parameters for an inheritAttrs option
 */
export function component(params?: ComponentParams): Function {
	return (target) => {
		const
			name = params && params.name || getComponentName(target),
			parent = Object.getPrototypeOf(target),
			parentMeta = components.get(parent);

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
			componentName: name.replace(isSmartComponent, ''),

			parentMeta,
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
				render(el: CreateElement, baseCtx: RenderContext): VNode {
					const
						{methods: {render: r}, component: {ctx}} = meta;

					if (r) {
						if (p.functional === true && ctx) {
							const fakeCtx = createFakeCtx(el, baseCtx, ctx);
							return patchVNode(r.fn.call(fakeCtx, el, baseCtx), fakeCtx, baseCtx);
						}

						return r.fn.call(this, el);
					}

					return el('span');
				}
			}
		};

		if (parentMeta) {
			p = inheritMeta(meta, parentMeta);
		}

		if (!p.name || !isSmartComponent.test(p.name)) {
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
					// tslint:disable-next-line:prefer-object-spread
					component.components = Object.assign(component.components || {}, localComponents.get(target));
				}

				log(`component:load:${name}`, component);
				resolve(component);
			};

			const addRenderAndResolve = (tpls) => {
				const
					fns = tpls.index();

				if (p.functional === true) {
					const
						{ctx} = meta.component;

					if (ctx) {
						component.render = convertRender(fns, ctx);
					}

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
			ComponentDriver.component(name, obj);
		}

		if (!Object.isBoolean(p.functional)) {
			component({
				...params,
				name: `${name}-functional`,
				functional: true
			})(target);
		}
	};
}
