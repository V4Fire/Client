/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import Vue, { WatchOptions, WatchHandler, ComputedOptions } from 'vue';
import inheritMeta from 'core/component/inherit';
import { InjectOptions } from 'vue/types/options';
import { EventEmitter2 } from 'eventemitter2';

export * from 'core/component/decorators';
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
	createWatchObject(path: string, fields: Array<WatchField<T>>, watchOptions?: WatchOptions): Dictionary;
}

export interface InitFieldFn {
	<O>(component: O & InitialComponent<O>, instance: O): void;
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
	watchers?: Dictionary<MethodWatcher>;
	hooks?: Dictionary<string>;
}

export interface ComponentMeta {
	name: string;
	params: ComponentParams;
	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	computed: Dictionary<ComputedOptions<any>>;
	accessors: Dictionary<ComputedOptions<any>>;
	methods: Dictionary<ComponentMethod>;
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
			computed: {},
			accessors: {},
			methods: {}
		};

		if (parentMeta) {
			p = inheritMeta(meta, parentMeta, p);
		}

		components.set(target, meta);
		initEvent.emit('constructor', {meta, parentMeta});

		const
			proto = target.prototype,
			ownProps = Object.getOwnPropertyNames(proto);

		for (let i = 0; i < ownProps.length; i++) {
			const
				key = ownProps[i];

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

		let
			component: Dictionary;

		const
			instance = new target(),
			props = {},
			methods = {};

		for (let o = meta.props, keys = Object.keys(meta.props), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			props[key] = {
				type: el.type,
				required: el.required,
				default: instance[key]
			};
		}

		for (let o = meta.methods, keys = Object.keys(meta.methods), i = 0; i < keys.length; i++) {
			const key = keys[i];
			methods[key] = o[key].fn;
		}

		if (p.functional) {

		} else {
			component = {
				...p.mixins,

				props,
				methods,
				computed: meta.computed,
				provide: p.provide,
				inject: p.inject,

				data(): Dictionary {
					const
						data = {},
						fields = meta.fields,
						keys = Object.keys(fields);

					for (let i = 0; i < keys.length; i++) {
						const
							key = this._activeField = keys[i],
							el = fields[key];

						let val;
						if (el.init) {
							val = el.init(this, instance);
						}

						data[key] = val === undefined ? el.default : val;
					}

					return data;
				},

				beforeCreate(): void {
					for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							el = o[key];

						Object.defineProperty(this, keys[i], {
							get: el.get,
							set: el.set
						});
					}
				},

				created(): void {

				}
			};
		}

		if (p.root) {
			// rootComponents[name];
		}
	};
}
