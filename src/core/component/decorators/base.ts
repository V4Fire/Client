/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PropOptions, WatchOptions } from 'vue';
import { Hooks, initEvent, InitFieldFn, VueInterface, MethodWatcher } from 'core/component';

export interface WatchHandler<T, A, B> {
	(this: T, value: A, oldValue: B): any;
}

export interface FieldWatcherObject<T, A, B> extends WatchOptions {
	fn: string | WatchHandler<T, A, B>;
}

export type FieldWatcher<T = VueInterface, A = any, B = A> =
	string |
	FieldWatcherObject<T, A, B> |
	WatchHandler<T, A, B> |
	Array<string | FieldWatcherObject<T, A, B> | WatchHandler<T, A, B>>;

export interface ComponentProp<T = VueInterface, A = any, B = A> extends PropOptions {
	watch?: FieldWatcher<T, A, B>;
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

export interface ComponentField<T = VueInterface, A = any, B = A> {
	default?: any;
	watch?: FieldWatcher<T, A, B>;
	init?: InitFieldFn<T>;
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
export const system = paramsFactory<InitFieldFn | ComponentField>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

export type HookParams = {[hook in Hooks]?: string | string[]};
export type MethodWatchers = Array<string | MethodWatcher>;
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
export const p = paramsFactory<ComponentProp | ComponentField | ComponentMethod>(null);

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
	return (p: any = {}) => (target, key, desc) => {
		// tslint:disable-next-line
		initEvent.once('constructor', ({meta}) => {
			if (desc) {
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
							watchers[el.field] = {...p.watchParams, ...el};

						} else {
							watchers[el] = {field: el, ...p.watchParams};
						}
					}

					const
						h = <any[]>[].concat(p.hook || []),
						hooks = el && el.hooks || {};

					for (let i = 0; i < h.length; i++) {
						const el = h[i];

						if (Object.isObject(el)) {
							const key = Object.keys(el)[0];
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

			const
				metaKey = cluster || (key in meta.props ? 'props' : 'fields'),
				obj = meta[metaKey];

			const inverse = {
				props: ['fields', 'systemFields'],
				fields: ['props', 'systemFields'],
				systemFields: ['props', 'props']
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
				w = <any[]>[].concat(p.watch || []),
				watchers = el && el.watchers || new Map();

			for (let i = 0; i < w.length; i++) {
				const
					el = w[i];

				if (Object.isObject(el)) {
					watchers.set(el.fn, {...el});

				} else {
					let fn = el;

					if (Object.isString(el)) {
						fn = function (a: any, b: any): any {
							return this[el](a, b);
						};
					}

					watchers.set(el, {fn});
				}
			}

			obj[key] = {...el, ...p, watchers};
		});
	};
}
