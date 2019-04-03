/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOpts } from 'core/async';
import iBlock from 'super/i-block/i-block';
import Lfc from 'super/i-block/modules/lfc';
import Field from 'super/i-block/modules/field';

import { statuses } from 'super/i-block/modules/const';
import { WatchOptions, ComponentMeta } from 'core/component';

export type AsyncWatchOpts =
	WatchOptions & AsyncOpts;

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;

export interface LinkWrapper<V = unknown, R = unknown> {
	(value: V, oldValue?: V): R;
}

export type BindModCb<V = unknown, R = unknown> =
	((value: V) => R) | Function;

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
		// @ts-ignore
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
	protected get activeField(): string {
		// @ts-ignore
		return this.component.$activeField;
	}

	/**
	 * Cache for prop/field synchronize functions
	 */
	protected get syncLinkCache(): SyncLinkCache {
		// @ts-ignore
		return this.component.$syncLinkCache;
	}

	/**
	 * Sets a new cache for prop/field synchronize functions
	 * @param value
	 */
	protected set syncLinkCache(value: SyncLinkCache) {
		// @ts-ignore
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
	link<D = unknown, R = D>(paramsOrWrapper?: AsyncWatchOpts | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param params - additional parameters
	 * @param [wrapper]
	 */
	link<D = unknown, R = D>(params: AsyncWatchOpts, wrapper?: LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param [paramsOrWrapper]
	 */
	link<D = unknown, R = D>(field: string, paramsOrWrapper?: AsyncWatchOpts | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param params
	 * @param [wrapper]
	 */
	link<D = unknown, R = D>(field: string, params: AsyncWatchOpts, wrapper?: LinkWrapper<D, R>): CanUndef<R>;
	link<D = unknown, R = D>(
		field?: string | AsyncWatchOpts | LinkWrapper<D>,
		params?: AsyncWatchOpts | LinkWrapper<D>,
		wrapper?: LinkWrapper<D>
	): CanUndef<R> {
		const
			path = this.activeField,
			cache = this.syncLinkCache;

		if (!field || !Object.isString(field)) {
			wrapper = <LinkWrapper<D>>params;
			params = <AsyncWatchOpts>field;
			field = `${path.replace(storeRgxp, '')}Prop`;
		}

		if (params && Object.isFunction(params)) {
			wrapper = params;
			params = undefined;
		}

		const
			{meta, component} = this;

		if (!(path in this.linksCache)) {
			this.linksCache[path] = {};

			const sync = (val?, oldVal?) => {
				val = val !== undefined ? val : this.field.get(<string>field);

				const
					res = wrapper ? wrapper.call(this, val, oldVal) : val;

				this.field.set(path, res);
				return res;
			};

			if (!component.isFlyweight && (!meta.props[field] || !component.isFunctional)) {
				component.watch(field, async (val, oldVal) => {
					if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(path))) {
						return;
					}

					sync(val, oldVal);
				}, params);
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
		params: AsyncWatchOpts,
		fields: SyncObjectFields<T>
	): Dictionary;

	object<T>(
		path: string,
		params: AsyncWatchOpts | SyncObjectFields<T>,
		fields?: SyncObjectFields<T>
	): Dictionary {
		if (Object.isArray(params)) {
			fields = <SyncObjectFields<T>>params;
			params = {};
		}

		const
			{meta, component, syncLinkCache, linksCache} = this;

		const
			hooks = meta.hooks.beforeDataCreate,
			head = this.activeField;

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

		const attachWatcher = (field, path, getVal) => {
			Object.set(linksCache, path, true);

			const
				sync = (val?, oldVal?) => setField(path, getVal(val, oldVal));

			if (!component.isFlyweight && (!meta.props[field] || !component.isFunctional)) {
				component.watch(field, (val, oldVal) => {
					if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(path))) {
						return;
					}

					sync(val, oldVal);
				}, <AsyncWatchOpts>params);
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
						val = val || this.field.get(field);
						return wrapper ? wrapper.call(this, val, oldVal) : val;
					};

					attachWatcher(field, l, getVal);
					cursor[el[0]] = getVal();
				}

			} else {
				const
					l = [path, el].join('.');

				if (!Object.get(linksCache, l)) {
					const getVal = (val?) => val || this.field.get(el);
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
		converter: BindModCb<D, R> | AsyncWatchOpts = (v) => v != null ? Boolean(v) : undefined,
		params?: AsyncWatchOpts
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
			component.watch(field, (val) => {
				val = fn.call(this, val);

				if (val !== undefined) {
					this.component.setMod(mod, val);
				}

			}, params);
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
