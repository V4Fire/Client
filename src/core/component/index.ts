/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { WatchOptions, WatchHandler, ComputedOptions } from 'vue';

import { EventEmitter2 } from 'eventemitter2';
export * from 'core/component/decorators';

export const
	initEvent = new EventEmitter2({maxListeners: 1e3}),
	rootComponents = {},
	components = new WeakMap();

export interface ComponentParams {
	root?: boolean;
	tpl?: boolean;
	functional?: false
}

export interface FieldWatcher extends WatchOptions {
	fn: string | WatchHandler<any>;
}

export interface ComponentProp {
	type?: Function;
	required?: boolean;
	default?: any;
	watchers?: Map<string | Function, FieldWatcher>;
}

export interface FieldWrapper<T> {
	(this: T & InitialComponent<T>, value: any): any;
}

export type WatchField<T> =
	string |
	[string, string] |
	[string, FieldWrapper<T>] |
	[string, string, FieldWrapper<T>];

export interface InitialComponent<T> {
	blockId: string;
	async: Async<any>;
	asyncQueue: Set<Function>;
	localEvent: EventEmitter2;
	link(field: string, wrapper?: FieldWrapper<T>, watchOptions?: WatchOptions): any;
	createWatchObject(path: string, fields: Array<WatchField<T>>, watchOptions?: WatchOptions): Record<string, any>;
}

export interface InitFieldFn {
	init<O>(o: O & InitialComponent<O>): void;
}

export interface ComponentField {
	default?: any;
	watchers?: Map<string | Function, FieldWatcher>;
	init?: InitFieldFn;
}

export interface MethodWatcher extends WatchOptions {
	field: string;
}

export interface ComponentMethod {
	fn: Function;
	watchers?: Record<string, MethodWatcher>;
	hooks?: Record<string, string>;
}

export interface ComponentMeta {
	name: string;
	params: ComponentParams;
	props: Record<string, ComponentProp>;
	fields: Record<string, ComponentField>;
	computed: Record<string, ComputedOptions<any>>;
	accessors: Record<string, ComputedOptions<any>>;
	methods: Record<string, ComponentMethod>;
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
export function component(params?: ComponentParams): Function {
	let p: ComponentParams = {
		root: false,
		tpl: true,
		functional: false,
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
			computed: {},
			accessors: {},
			methods: {}
		};

		if (parentMeta) {
			const {
				params,
				props,
				fields,
				computed,
				accessors,
				methods
			} = parentMeta;

			p = meta.params = {
				...params,
				...p
			};

			for (let o = meta.props, keys = Object.keys(props), i = 0; i < keys.length; i++) {
				const
					key = <string>keys[i],
					el = props[key],
					watchers = new Map();

				if (el.watchers) {
					const
						w = el.watchers.values();

					for (let el = w.next(); !el.done; el = w.next()) {
						watchers.set(el.value.fn, {...el.value});
					}
				}

				o[key] = {...el, watchers};
			}

			for (let o = meta.fields, keys = Object.keys(fields), i = 0; i < keys.length; i++) {
				const
					key = <string>keys[i],
					el = fields[key],
					watchers = new Map();

				if (el.watchers) {
					const
						w = el.watchers.values();

					for (let el = w.next(); !el.done; el = w.next()) {
						watchers.set(el.value.fn, {...el.value});
					}
				}

				o[key] = {...el, watchers};
			}

			for (let o = meta.computed, keys = Object.keys(computed), i = 0; i < keys.length; i++) {
				const key = <string>keys[i];
				o[key] = {...computed[key]};
			}

			for (let o = meta.accessors, keys = Object.keys(accessors), i = 0; i < keys.length; i++) {
				const key = <string>keys[i];
				o[key] = {...accessors[key]};
			}

			for (let o = meta.methods, keys = Object.keys(methods), i = 0; i < keys.length; i++) {
				const
					key = <string>keys[i],
					el = methods[key],
					watchers = {},
					hooks = {};

				if (el.watchers) {
					const
						o = el.watchers,
						w = Object.keys(o);

					for (let i = 0; i < w.length; i++) {
						const key = <string>w[i];
						watchers[key] = {...o[key]};
					}
				}

				if (el.hooks) {
					const
						o = el.hooks,
						w = Object.keys(o);

					for (let i = 0; i < w.length; i++) {
						const key = <string>w[i];
						hooks[key] = {...o[key]};
					}
				}

				o[key] = {...el, watchers, hooks};
			}
		}

		components.set(target, meta);
		initEvent.emit('constructor', {meta, parentMeta});

		const
			proto = target.prototype,
			methods = Object.getOwnPropertyNames(proto);

		for (let i = 0; i < methods.length; i++) {
			const
				key = methods[i];

			if (key === 'constructor') {
				continue;
			}

			const
				desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

			if ('value' in desc) {
				// tslint:disable-next-line
				meta.methods[key] = Object.assign(meta.methods[key] || {}, {
					fn: desc.value
				});

			} else {
				const
					o = meta[key in meta.accessors ? 'accessors' : 'computed'],
					old = o[key];

				Object.assign(meta[key in meta.accessors ? 'accessors' : 'computed'], {
					[key]: {
						get: desc.get || old && old.get,
						set: desc.set || old && old.set
					}
				});
			}
		}

		if (p.root) {
			// rootComponents[name];
		}
	};
}
