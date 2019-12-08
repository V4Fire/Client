/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOptions } from 'core/async';
import iBlock from 'super/i-block/i-block';
import Lfc from 'super/i-block/modules/lfc';
import Field from 'super/i-block/modules/field';

import { statuses } from 'super/i-block/modules/const';
import { SyncLinkCache, WatchOptions, ComponentMeta } from 'core/component';

export type AsyncWatchOptions =
	WatchOptions & AsyncOptions;

export interface LinkWrapper<V = unknown, R = unknown> {
	(value: V, oldValue?: V): R;
}

export type SyncObjectField<T = unknown> =
	string |
	[string] |
	[string, string] |
	[string, LinkWrapper<T, any>] |
	[string, string, LinkWrapper<T, any>];

export type SyncObjectFields<T = unknown> = Array<
	SyncObjectField<T>
	>;

const
	storeRgxp = /Store$/;

export default class Sync {
	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Component meta object
	 */
	protected get meta(): ComponentMeta {
		// @ts-ignore (access)
		return this.component.meta;
	}

	/**
	 * API for component life cycle helpers
	 */
	protected get lfc(): Lfc {
		return this.component.lfc;
	}

	/**
	 * API for component field accessors
	 */
	protected get field(): Field {
		return this.component.field;
	}

	/**
	 * Link to the component $activeField
	 */
	protected get activeField(): CanUndef<string> {
		// @ts-ignore (access)
		return this.component.$activeField;
	}

	/**
	 * Cache for prop/field synchronize functions
	 */
	protected get syncLinkCache(): SyncLinkCache {
		// @ts-ignore (access)
		return this.component.$syncLinkCache;
	}

	/**
	 * Sets a new cache for prop/field synchronize functions
	 * @param value
	 */
	protected set syncLinkCache(value: SyncLinkCache) {
		// @ts-ignore (access)
		this.component.$syncLinkCache = value;
	}

	/**
	 * Cache for prop/field links
	 */
	protected readonly linksCache!: Dictionary<Dictionary>;

	/**
	 * Cache for modifiers synchronize functions
	 */
	protected readonly syncModCache!: Dictionary<Function>;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
		this.linksCache = {};
		this.syncLinkCache = {};
		this.syncModCache = {};
	}

	/**
	 * Sets a link for the specified field
	 *
	 * @see Async.worker
	 * @param [paramsOrWrapper] - additional parameters or wrapper
	 */
	link<D = unknown, R = D>(paramsOrWrapper?: AsyncWatchOptions | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param params - additional parameters
	 * @param [wrapper]
	 */
	link<D = unknown, R = D>(params: AsyncWatchOptions, wrapper?: LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param [paramsOrWrapper]
	 */
	link<D = unknown, R = D>(field: string, paramsOrWrapper?: AsyncWatchOptions | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param params
	 * @param [wrapper]
	 */
	link<D = unknown, R = D>(field: string, params: AsyncWatchOptions, wrapper?: LinkWrapper<D, R>): CanUndef<R>;
	link<D = unknown, R = D>(
		field?: string | AsyncWatchOptions | LinkWrapper<D>,
		params?: AsyncWatchOptions | LinkWrapper<D>,
		wrapper?: LinkWrapper<D>
	): CanUndef<R> {
		const
			path = this.activeField;

		if (path === undefined) {
			throw new Error('Method "sync.link" can\'t be used outside from a property decorator');
		}

		const
			{meta, component, linksCache, syncLinkCache: cache, component: {$options: {propsData}}} = this;

		let
			isProp;

		if (!field || !Object.isString(field)) {
			wrapper = <LinkWrapper<D>>params;
			params = <AsyncWatchOptions>field;
			field = `${path.replace(storeRgxp, '')}Prop`;
			isProp = true;

		} else {
			isProp = Boolean(meta.props[field]);
		}

		if (params && Object.isFunction(params)) {
			wrapper = params;
			params = {};
		}

		params = params || {};
		params.immediate = params.immediate !== false;

		if (!linksCache[path]) {
			linksCache[path] = {};

			const sync = (val?, oldVal?) => {
				val = val !== undefined ? val : this.field.get(<string>field);

				const
					res = wrapper ? wrapper.call(this, val, oldVal) : val;

				this.field.set(path, res);
				return res;
			};

			if (
				!component.isFlyweight && (component.isFunctional ?
					!isProp :
					!isProp || !propsData || field in propsData
				)
			) {
				if (wrapper && wrapper.length > 1) {
					component.watch(field, (val, oldVal) => {
						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(path))) {
							return;
						}

						sync(val, oldVal);
					}, params);

				} else {
					const
						that = this;

					// tslint:disable-next-line:only-arrow-functions
					component.watch(field, function (val?: unknown): void {
						const
							oldVal = arguments[1];

						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, that.field.get(path))) {
							return;
						}

						sync(val, oldVal);
					}, params);
				}
			}

			// tslint:disable-next-line:prefer-object-spread
			cache[field] = Object.assign(cache[field] || {}, {
				[path]: {
					path,
					sync
				}
			});

			if (this.lfc.isBeforeCreate('beforeDataCreate')) {
				const
					name = '[[SYNC]]',
					hooks = meta.hooks.beforeDataCreate;

				let
					pos = 0;

				for (let i = 0; i < hooks.length; i++) {
					if (hooks[i].name === name) {
						pos = i + 1;
					}
				}

				hooks.splice(pos, 0, {fn: sync, name});
				return;
			}

			return sync();
		}
	}

	/**
	 * Creates an object with linked fields
	 *
	 * @param path - property path
	 * @param fields
	 */
	object<T = unknown>(
		path: string,
		fields: SyncObjectFields<T>
	): Dictionary;

	/**
	 * @param path - property path
	 * @param params - additional parameters
	 * @param fields
	 */
	object<T = unknown>(
		path: string,
		params: AsyncWatchOptions,
		fields: SyncObjectFields<T>
	): Dictionary;

	object<T>(
		path: string,
		params: AsyncWatchOptions | SyncObjectFields<T>,
		fields?: SyncObjectFields<T>
	): Dictionary {
		const
			head = this.activeField;

		if (head === undefined) {
			throw new Error('Method "sync.object" can\'t be used outside from a property decorator');
		}

		if (Object.isArray(params)) {
			fields = <SyncObjectFields<T>>params;
			params = {};
		}

		params = params || {};
		params.immediate = params.immediate !== false;

		const
			{meta, component, syncLinkCache, linksCache, component: {$options: {propsData}}} = this;

		const
			hooks = meta.hooks.beforeDataCreate;

		// tslint:disable-next-line:prefer-conditional-expression
		if (path) {
			path = [head, path].join('.');

		} else {
			path = head;
		}

		const
			tail = path.split('.').slice(1),
			obj = {};

		if (tail.length) {
			Object.set(obj, tail, {});
		}

		const
			cursor = Object.get<StrictDictionary>(obj, tail);

		const merge = (...args) => Object.mixin({
			deep: true,
			extendFilter: (d, v) => Object.isObject(v)
		}, undefined, ...args);

		const setField = (path, val) => {
			const
				newObj = {};

			Object.set(newObj, path.split('.').slice(1), val);
			this.field.set(head, merge(this.field.get(head), newObj));

			return val;
		};

		const attachWatcher = (field, path, getVal, clone?) => {
			Object.set(linksCache, path, true);

			const
				sync = (val?, oldVal?) => setField(path, getVal(val, oldVal)),
				isProp = meta.props[field];

			if (!component.isFlyweight && (component.isFunctional ?
					!isProp :
					!isProp || !propsData || field in propsData
			)) {
				if (clone) {
					component.watch(field, (val, oldVal) => {
						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(path))) {
							return;
						}

						sync(val, oldVal);
					}, <AsyncWatchOptions>params);

				} else {
					const
						that = this;

					// tslint:disable-next-line:only-arrow-functions
					component.watch(field, function (val?: unknown): void {
						const
							oldVal = arguments[1];

						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, that.field.get(path))) {
							return;
						}

						sync(val, oldVal);
					}, <AsyncWatchOptions>params);
				}
			}

			// tslint:disable-next-line:prefer-object-spread
			syncLinkCache[field] = Object.assign(syncLinkCache[field] || {}, {
				[path]: {
					path,
					sync
				}
			});

			if (this.lfc.isBeforeCreate('beforeDataCreate')) {
				hooks.push({fn: sync});
			}
		};

		for (let i = 0; i < (<unknown[]>fields).length; i++) {
			const
				el = (<SyncObjectFields<T>>fields)[i];

			if (Object.isArray(el)) {
				let
					wrapper,
					field;

				if (el.length === 3) {
					field = el[1];
					wrapper = el[2];

				} else if (Object.isFunction(el[1])) {
					field = el[0];
					wrapper = el[1];

				} else {
					field = el[1];
				}

				const
					l = [path, el[0]].join('.');

				if (!Object.get(linksCache, l)) {
					const getVal = (val?, oldVal?) => {
						val = val !== undefined ? val : this.field.get(field);
						return wrapper ? wrapper.call(this, val, oldVal) : val;
					};

					attachWatcher(field, l, getVal, wrapper && wrapper.length > 1);
					cursor[el[0]] = getVal();
				}

			} else {
				const
					l = [path, el].join('.');

				if (!Object.get(linksCache, l)) {
					const getVal = (val?) => val !== undefined ? val : this.field.get(el);
					attachWatcher(el, l, getVal);
					cursor[el] = getVal();
				}
			}
		}

		return obj;
	}

	/**
	 * Synchronizes component link values with linked values
	 *
	 * @param [name] - link name or [linked] | [linked, link]
	 * @param [value] - additional value for sync
	 */
	syncLinks(name?: string | [string] | [string, string], value?: unknown): void {
		const
			linkName = <CanUndef<string>>(Object.isString(name) ? name : name && name[1]),
			fieldName = Object.isArray(name) ? name[0] : undefined;

		const
			cache = this.syncLinkCache;

		const sync = (linkName) => {
			const
				o = cache[linkName];

			if (!o) {
				return;
			}

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (!el) {
					continue;
				}

				if (!fieldName || key === fieldName) {
					el.sync(value);
				}
			}
		};

		if (linkName) {
			sync(linkName);

		} else {
			for (let keys = Object.keys(cache), i = 0; i < keys.length; i++) {
				sync(keys[i]);
			}
		}
	}

	/**
	 * Binds a modifier to the specified field
	 *
	 * @param mod
	 * @param field
	 * @param [converter] - converter function or additional parameters
	 * @param [params] - additional parameters
	 */
	mod<D = unknown, R = unknown>(
		mod: string,
		field: string,
		converter: LinkWrapper<D, R> | Function | AsyncWatchOptions = (v) => v != null ? Boolean(v) : undefined,
		params?: AsyncWatchOptions
	): void {
		mod = mod.camelize(false);

		if (!Object.isFunction(converter)) {
			params = converter;
			converter = Boolean;
		}

		const
			{component} = this;

		const
			fn = <Function>converter;

		const setWatcher = () => {
			const wrapper = (val, ...args) => {
				val = fn.call(this, val, ...args);

				if (val !== undefined) {
					this.component.setMod(mod, val);
				}
			};

			if (fn.length > 1) {
				// tslint:disable-next-line:no-unnecessary-callback-wrapper
				component.watch(field, (val, oldVal) => wrapper(val, oldVal), params);

			} else {
				component.watch(field, wrapper, params);
			}
		};

		if (this.lfc.isBeforeCreate()) {
			const sync = this.syncModCache[mod] = () => {
				const
					v = fn.call(this, this.field.get(field));

				if (v !== undefined) {
					component.mods[mod] = String(v);
				}
			};

			if (component.hook !== 'beforeDataCreate') {
				this.meta.hooks.beforeDataCreate.push({
					fn: sync
				});

			} else {
				sync();
			}

			setWatcher();

		} else if (statuses[component.componentStatus] >= 1) {
			setWatcher();
		}
	}
}
