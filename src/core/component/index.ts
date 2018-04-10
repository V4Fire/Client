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
import inheritMeta, { PARENT } from 'core/component/inherit';
import VueInterface from 'core/component/vue';

import { getComponent, getBaseComponent } from 'core/component/component';
import { convertRender, createFakeCtx, patchVNode } from 'core/component/functional';
import { InjectOptions } from 'vue/types/options';
import { EventEmitter2 } from 'eventemitter2';

export * from 'core/component/decorators';
export * from 'core/component/functional';

export { PARENT } from 'core/component/inherit';
export { default as VueInterface, VueElement } from 'core/component/vue';

export const
	initEvent = new EventEmitter2({maxListeners: 1e3}),
	rootComponents = Object.createDict(),
	localComponents = new WeakMap(),
	components = new WeakMap();

export interface ComponentParams {
	name?: string;
	root?: boolean;
	tpl?: boolean;
	functional?: boolean | Dictionary;
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
	default?: any;
}

export interface InitFieldFn<T extends VueInterface = VueInterface> {
	(ctx: T, data: Dictionary): any;
}

export interface ComponentField<T extends VueInterface = VueInterface> {
	after: Set<string>;
	watchers: Map<string | Function, FieldWatcher>;
	init?: InitFieldFn<T>;
	default?: any;
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
	'errorCaptured' |
	'beforeRender' |
	'afterRender';

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
 *   *) [root] - if true, then the component will be registered as root
 *   *) [functional] - if true, then the component will be created as functional
 *   *) [tpl] - if false, then will be used the default template
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
			inheritAttrs: false,
			mixins: {},
			...params
		};

		const meta: ComponentMeta = {
			name,
			componentName: name.replace(/-fn$/, ''),
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
				errorCaptured: [],
				beforeRender: [],
				afterRender: []
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

						return r.fn.apply(this, arguments);
					}
				}
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
				name: `${name}-fn`,
				functional: true
			})(target);
		}
	};
}
