/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initEvent } from 'core/component/const';
import { WatchOptions } from 'core/component/engines';

import {

	PropOptions,
	ComponentInterface,
	ComponentMeta,
	Hooks,

	InitFieldFn,
	MergeFieldFn,
	UniqueFieldFn,

	MethodWatcher,
	WatchHandler

} from 'core/component/interface';

export interface FieldWatcherObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: string | WatchHandler<CTX, A, B>;
	provideArgs?: boolean;
}

export type FieldWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	FieldWatcherObject<CTX, A, B> |
	WatchHandler<CTX, A, B> |
	Array<string | FieldWatcherObject<CTX, A, B> | WatchHandler<CTX, A, B>>;

export interface ComponentProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends PropOptions {
	forceDefault?: boolean;
	watch?: FieldWatcher<CTX, A, B>;
	meta?: Dictionary;
}

export interface FunctionalOpts {
	replace?: boolean;
	functional?: boolean;
}

export interface ComponentAccessor extends FunctionalOpts {
	cache: boolean;
}

/**
 * Marks a class property as a component initial property
 * @decorator
 */
export const prop = paramsFactory<CanArray<Function> | ObjectConstructor | ComponentProp>('props', (p) => {
	if (Object.isFunction(p) || Object.isArray(p)) {
		return {type: p};
	}

	return p;
});

export interface SystemField<CTX extends ComponentInterface = ComponentInterface> extends FunctionalOpts {
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;
	after?: CanArray<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta?: Dictionary;
}

export interface ComponentField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends SystemField<CTX> {
	watch?: FieldWatcher<CTX, A, B>;
}

/**
 * Marks a class property as a component data property
 * @decorator
 */
export const field = paramsFactory<InitFieldFn | ComponentField>('fields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Marks a class property as a system property
 * @decorator
 */
export const system = paramsFactory<InitFieldFn | SystemField>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

export type HookParams = {
	[hook in Hooks]?: FunctionalOpts & {
		after?: CanArray<string>;
	}
};

export type ComponentHooks =
	Hooks |
	Hooks[] |
	HookParams |
	HookParams[];

export type MethodWatchers<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;

export interface ComponentMethod<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	watch?: MethodWatchers<CTX, A, B>;
	watchParams?: WatchOptions;
	hook?: ComponentHooks;
}

/**
 * Universal decorator of component properties
 * @decorator
 */
export const p = paramsFactory<ComponentProp | ComponentField | ComponentMethod | ComponentAccessor>(null);

/**
 * Attaches a hook listener to a method
 * @decorator
 */
export const hook = paramsFactory<ComponentHooks>(null, (hook) => ({hook}));

/**
 * Attaches a watch listener to a method or a field
 * @decorator
 */
export const watch = paramsFactory<FieldWatcher | MethodWatchers>(null, (watch) => ({watch}));

/**
 * Factory for creating component property decorators
 *
 * @param cluster - property cluster
 * @param [transformer] - transformer for parameters
 */
export function paramsFactory<T = unknown>(
	cluster: Nullable<string>,
	transformer?: (params: any, cluster: string) => Dictionary<any>
): (params?: T) => Function {
	return (params: Dictionary<any> = {}) => (target, key, desc) => {
		initEvent.once('constructor', ({meta}: {meta: ComponentMeta}) => {
			const wrapOpts = (opts) => {
				const
					p = meta.params;

				if (opts.replace === undefined && p.flyweight) {
					opts.replace = false;
				}

				if (opts.functional === undefined && p.functional === null) {
					opts.functional = false;
				}

				return opts;
			};

			let
				p = params;

			if (desc) {
				delete meta.props[key];
				delete meta.fields[key];
				delete meta.systemFields[key];

				const metaKey = cluster || (
					'value' in desc ? 'methods' : key in meta.computed && p.cache !== false ? 'computed' : 'accessors'
				);

				if (transformer) {
					p = transformer(p, metaKey);
				}

				const
					obj = meta[metaKey],
					el = obj[key] || {src: meta.componentName};

				if (metaKey === 'methods') {
					const
						name = key,
						w = <any[]>[].concat(p.watch || []),
						watchers = el.watchers || {};

					for (let i = 0; i < w.length; i++) {
						const
							el = w[i];

						if (Object.isObject(el)) {
							watchers[String((<Dictionary>el).field)] = wrapOpts({...p.watchParams, ...el});

						} else {
							watchers[el] = {field: el, ...p.watchParams};
						}
					}

					const
						h = <any[]>[].concat(p.hook || []),
						hooks = el.hooks || {};

					for (let i = 0; i < h.length; i++) {
						const
							el = h[i];

						if (Object.isObject(el)) {
							const
								key = Object.keys(el)[0],
								val = el[key];

							hooks[key] = wrapOpts({
								...val,
								name,
								hook: key,
								after: new Set(val.after || [])
							});

						} else {
							hooks[el] = {name, hook: el};
						}
					}

					obj[key] = wrapOpts({...el, ...p, watchers, hooks});
					return;
				}

				const hasCache = 'cache' in p;
				delete p.cache;

				if (metaKey === 'accessors' ? key in meta.computed : !hasCache && key in meta.accessors) {
					obj.accessors = wrapOpts({...meta.computed[key], ...p});
					delete meta.computed[key];

				} else {
					obj[key] = wrapOpts({...el, ...p});
				}

				return;
			}

			delete meta.methods[key];
			delete meta.accessors[key];
			delete meta.computed[key];

			const
				accessors = meta.accessors[key] ? meta.accessors : meta.computed;

			if (accessors[key]) {
				Object.defineProperty(meta.constructor.prototype, key, {
					writable: true,
					configurable: true,
					value: undefined
				});

				delete accessors[key];
			}

			const
				metaKey = cluster || (key in meta.props ? 'props' : 'fields'),
				obj = meta[metaKey];

			const inverse = {
				props: ['fields', 'systemFields'],
				fields: ['props', 'systemFields'],
				systemFields: ['props', 'fields']
			}[metaKey];

			if (inverse) {
				for (let i = 0; i < inverse.length; i++) {
					const
						tmp = meta[inverse[i]];

					if (key in tmp) {
						obj[key] = tmp[key];
						delete tmp[key];
						break;
					}
				}
			}

			if (transformer) {
				p = transformer(p, metaKey);
			}

			const
				el = obj[key] || {src: meta.componentName},
				watchers = el.watchers || new Map(),
				after = el.after || new Set();

			for (let o = <any[]>[].concat(p.after || []), i = 0; i < o.length; i++) {
				after.add(o[i]);
			}

			for (let o = <any[]>[].concat(p.watch || []), i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (Object.isObject(el)) {
					watchers.set((<Dictionary>el).fn, wrapOpts({...el}));

				} else {
					watchers.set(el, {fn: el});
				}
			}

			obj[key] = wrapOpts({
				...el,
				...p,

				after,
				watchers,

				meta: {
					...el.meta,
					...p.meta
				}
			});
		});
	};
}
