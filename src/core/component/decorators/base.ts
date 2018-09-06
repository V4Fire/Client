/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PropOptions, WatchOptions } from 'vue';
import {

	Hooks,
	initEvent,
	InitFieldFn,
	MergeFieldFn,
	UniqueFieldFn,
	VueInterface,
	MethodWatcher,
	ComponentMeta

} from 'core/component';

export interface WatchHandler<T, A, B> {
	(ctx: T, value: A, oldValue: B): any;
}

export interface FieldWatcherObject<T, A, B> extends WatchOptions {
	fn: string | WatchHandler<T, A, B>;
	provideArgs?: boolean;
}

export type FieldWatcher<T extends VueInterface = VueInterface, A = any, B = A> =
	string |
	FieldWatcherObject<T, A, B> |
	WatchHandler<T, A, B> |
	Array<string | FieldWatcherObject<T, A, B> | WatchHandler<T, A, B>>;

export interface ComponentProp<T extends VueInterface = VueInterface, A = any, B = A> extends PropOptions {
	watch?: FieldWatcher<T, A, B>;
}

export interface ComponentAccessor {
	cache: boolean;
}

/**
 * Marks a class property as a Vue component initial property
 * @decorator
 */
export const prop = paramsFactory<Function | ObjectConstructor | ComponentProp>('props', (p) => {
	if (Object.isFunction(p)) {
		return {type: p};
	}

	return p;
});

export interface SystemField<T extends VueInterface = VueInterface> {
	atom?: boolean;
	default?: any;
	unique?: boolean | UniqueFieldFn<T>;
	after?: string | string[];
	init?: InitFieldFn<T>;
	merge?: MergeFieldFn<T> | boolean;
}

export interface ComponentField<T extends VueInterface = VueInterface, A = any, B = A> extends SystemField<T> {
	watch?: FieldWatcher<T, A, B>;
}

/**
 * Marks a class property as a Vue component data property
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

export type HookParams = {[hook in Hooks]?: string | string[]};
export type MethodWatchers = string | MethodWatcher | Array<string | MethodWatcher>;
export type ComponentHooks = Hooks | Hooks[] | HookParams | HookParams[];

export interface ComponentMethod {
	watch?: MethodWatchers;
	watchParams?: WatchOptions,
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
export function paramsFactory<T>(
	cluster: string | null,
	transformer?: (params: any, cluster: string) => any
): (params?: T) => Function {
	return (params: any = {}) => (target, key, desc) => {
		// tslint:disable-next-line
		initEvent.once('constructor', ({meta}: {meta: ComponentMeta}) => {
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
					el = obj[key];

				if (metaKey === 'methods') {
					const
						name = key,
						w = <any[]>[].concat(p.watch || []),
						watchers = el && el.watchers || {};

					for (let i = 0; i < w.length; i++) {
						const
							el = w[i];

						if (Object.isObject(el)) {
							watchers[el.field || el.event.dasherize()] = {...p.watchParams, ...el};

						} else {
							watchers[el] = {field: el, ...p.watchParams};
						}
					}

					const
						h = <any[]>[].concat(p.hook || []),
						hooks = el && el.hooks || {};

					for (let i = 0; i < h.length; i++) {
						const
							el = h[i];

						if (Object.isObject(el)) {
							const
								key = Object.keys(el)[0];

							hooks[key] = {
								name,
								hook: key,
								after: new Set([].concat(el[key] || []))
							};

						} else {
							hooks[el] = {name, hook: el};
						}
					}

					obj[key] = {...el, ...p, watchers, hooks};
					return;
				}

				if (metaKey === 'accessors' ? key in meta.computed : !('cache' in p) && key in meta.accessors) {
					obj.accessors = meta.computed[key];
					delete meta.computed[key];

				} else {
					obj[key] = {};
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
				el = obj[key],
				watchers = el && el.watchers || new Map(),
				after = el && el.after || new Set();

			for (let o = <any[]>[].concat(p.after || []), i = 0; i < o.length; i++) {
				after.add(o[i]);
			}

			for (let o = <any[]>[].concat(p.watch || []), i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (Object.isObject(el)) {
					watchers.set(el.fn, {...el});

				} else {
					watchers.set(el, {fn: el});
				}
			}

			obj[key] = {
				...el,
				...p,
				after,
				watchers
			};
		});
	};
}
