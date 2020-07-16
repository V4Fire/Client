/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/sync/README.md]]
 * @packageDocumentation
 */

import { isProxy } from 'core/object/watch';
import { bindingRgxp, customWatcherRgxp, getPropertyInfo, SyncLinkCache } from 'core/component';

import Friend from 'super/i-block/modules/friend';
import { statuses } from 'super/i-block/const';

import {

	LinkDecl,
	ObjectLinkDecl,
	ObjectPropLinksDecl,

	Link,
	LinkWrapper,

	ModValueConverter,
	AsyncWatchOptions

} from 'super/i-block/modules/sync/interface';

export * from 'super/i-block/modules/sync/interface';

/**
 * Class provides API to organize a "link" from one component property to another
 */
export default class Sync extends Friend {
	/**
	 * Cache of functions to synchronize modifiers
	 */
	readonly syncModCache!: Dictionary<Function>;

	/** @see [[iBlock.$syncLinkCache]] */
	protected get syncLinkCache(): SyncLinkCache {
		return this.ctx.$syncLinkCache;
	}

	/** @see [[iBlock.$syncLinkCache]] */
	protected set syncLinkCache(value: SyncLinkCache) {
		Object.set(this.ctx, '$syncLinkCache', value);
	}

	/**
	 * Cache for links
	 */
	protected readonly linksCache!: Dictionary<Dictionary>;

	/** @override */
	constructor(component: any) {
		super(component);
		this.linksCache = Object.createDict();
		this.syncLinkCache = new Map();
		this.syncModCache = Object.createDict();
	}

	/**
	 * Sets a link to a property that logically connected to the current property.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * Logical connection is based on a name convention: properties that matches the pattern
	 * "${property} -> ${property}Prop | ${property}Store -> ${property}Prop"
	 * are connected with each other.
	 *
	 * Mind, this method can be used only within a property decorator.
	 *
	 * @param [optsOrWrapper] - additional options or a wrapper
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   blaProp: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.link())
	 *   bla!: number;
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(optsOrWrapper?: AsyncWatchOptions | LinkWrapper<this['C'], D, R>): CanUndef<R>;

	/**
	 * Sets a link to a property that logically connected to the current property.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * Logical connection is based on a name convention:
	 * properties that matches the pattern "${property} -> ${property}Prop" are connected with each other.
	 *
	 * Mind, this method can be used only within a property decorator.
	 *
	 * @param opts - additional options
	 * @param [wrapper]
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   blaProp: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.link({deep: true}, (val) => val + 1}))
	 *   bla!: number;
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(opts: AsyncWatchOptions, wrapper?: LinkWrapper<this['C'], D, R>): CanUndef<R>;

	/**
	 * Sets a link to a component/object property or event by the specified path.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * @see [[iBlock.watch]]
	 * @param path - path to a property/event that we are referring or
	 *   [path to a property that contains a link, path to a property/event that we are referring]
	 *
	 * @param [optsOrWrapper] - additional options or a wrapper
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   bla: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.link('bla'))
	 *   baz!: number;
	 *
	 *   @field((ctx) => ctx.sync.link({ctx: remoteObject, path: 'bla'}))
	 *   ban!: number;
	 * }
	 * ```
	 *
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   baz!: number;
	 *
	 *   @field()
	 *   ban!: number;
	 *
	 *   created() {
	 *     this.baz = this.sync.link(['baz', 'bla']);
	 *     this.ban = this.sync.link(['ban', remoteObject]);
	 *   }
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(
		path: ObjectLinkDecl,
		optsOrWrapper?: AsyncWatchOptions | LinkWrapper<this['C'], D, R>
	): CanUndef<R>;

	/**
	 * Sets a link to a component/object property or event by the specified path.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * @see [[iBlock.watch]]
	 * @param path - path to a property/event that we are referring or
	 *   [path to a property that contains a link, path to a property/event that we are referring]
	 *
	 * @param opts - additional options
	 * @param [wrapper]
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   bla: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.link('bla', {deep: true}, (val) => val + 1))
	 *   baz!: number;
	 *
	 *   @field((ctx) => ctx.sync.link({ctx: remoteObject, path: 'bla'}, {deep: true}, (val) => val + 1)))
	 *   ban!: number;
	 * }
	 * ```
	 *
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   baz!: number;
	 *
	 *   @field()
	 *   ban!: number;
	 *
	 *   created() {
	 *     this.baz = this.sync.link(['baz', 'bla'], {deep: true}, (val) => val + 1));
	 *     this.ban = this.sync.link(['ban', remoteObject], {deep: true}, (val) => val + 1));
	 *   }
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(
		path: ObjectLinkDecl,
		opts: AsyncWatchOptions,
		wrapper?: LinkWrapper<this['C'], D, R>
	): CanUndef<R>;

	link<D = unknown, R = D>(
		path?: ObjectLinkDecl | AsyncWatchOptions | LinkWrapper<this['C'], D>,
		opts?: AsyncWatchOptions | LinkWrapper<this['C'], D>,
		wrapper?: LinkWrapper<this['C'], D>
	): CanUndef<R> {
		let
			head;

		if (Object.isArray(path)) {
			head = path[0];
			path = path[1];

		} else {
			head = this.activeField;
		}

		if (head == null) {
			throw new Error('Path to the property that is contained a link is not defined');
		}

		const {
			meta,
			ctx,
			linksCache,
			syncLinkCache
		} = this;

		if (linksCache[head]) {
			return;
		}

		let
			info,
			isRemoteWatcher = false,
			isCustomWatcher = false;

		if (path == null || !Object.isString(path)) {
			if (isProxy(path)) {
				isRemoteWatcher = true;
				info = {ctx: path};
				path = undefined;

			} else if (isProxy((<any>path)?.ctx)) {
				isRemoteWatcher = true;
				info = path;
				path = info.path;

			} else {
				wrapper = <LinkWrapper<this['C'], D>>opts;
				opts = path;
				path = `${head.replace(bindingRgxp, '')}Prop`;
			}

		} else if (!customWatcherRgxp.test(path)) {
			info = getPropertyInfo(path, this.ctx);

		} else {
			isCustomWatcher = true;
		}

		if (Object.isFunction(opts)) {
			wrapper = opts;
			opts = {};
		}

		opts = opts ?? {};

		const isAccessor = info != null ?
			Boolean(
				info.type === 'accessor' ||
				info.type === 'computed' ||
				info.accessor
			) :

			false;

		if (isAccessor) {
			opts.immediate = opts.immediate !== false;
		}

		linksCache[head] = {};

		const sync = (val?, oldVal?) => {
			const res = wrapper ? wrapper.call(this.component, val, oldVal) : val;
			this.field.set(head, res);
			return res;
		};

		if ((wrapper?.length ?? 0) > 1) {
			ctx.watch(info ?? path, opts, (val, oldVal) => {
				if (isCustomWatcher) {
					oldVal = undefined;

				} else if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(head))) {
					return;
				}

				sync(val, oldVal);
			});

		} else {
			ctx.watch(info ?? path, opts, (val, ...args) => {
				let
					oldVal;

				if (!isCustomWatcher) {
					oldVal = args[0];

					if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(head))) {
						return;
					}
				}

				sync(val, oldVal);
			});
		}

		{
			const
				key = Object.isString(path) ? path : info?.ctx ?? path;

			syncLinkCache.set(key, Object.assign(syncLinkCache.get(key) ?? {}, {
				[head]: {
					path: head,
					sync
				}
			}));
		}

		if (isCustomWatcher) {
			return sync();
		}

		if (isRemoteWatcher) {
			const
				obj = info?.ctx;

			if (Object.isString(path) || Object.isArray(path)) {
				return sync(Object.get(obj, path));
			}

			return sync(obj);
		}

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

		return sync(this.field.get(info != null ? info.originalPath : path));
	}

	/**
	 * Creates an object where all keys are referring to another properties/events as links.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * Mind, this method can be used only within a property decorator.
	 *
	 * @see [[iBlock.watch]]
	 * @param decl - declaration of object properties
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   bar: number = 0;
	 *
	 *   @field()
	 *   bad: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.object([
	 *     'bla',
	 *     ['bar', 'barAlias'],
	 *     ['bad', String]
	 *   ]))
	 *
	 *   baz!: {bla: number; barAlias: number; bad: string}};
	 * }
	 * ```
	 */
	object(decl: ObjectPropLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties/events as links.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * Mind, this method can be used only within a property decorator.
	 *
	 * @see [[iBlock.watch]]
	 * @param opts - additional options
	 * @param fields - declaration of object properties
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   bar: number = 0;
	 *
	 *   @field()
	 *   bad: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.object({deep: true}, [
	 *     'bla',
	 *     ['bar', 'barAlias'],
	 *     ['bad', String]
	 *   ]))
	 *
	 *   baz!: {bla: number; barAlias: number; bad: string}};
	 * }
	 * ```
	 */
	object(opts: AsyncWatchOptions, fields: ObjectPropLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties/events as links.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * @see [[iBlock.watch]]
	 * @param path - path to a property that contains the result object
	 *   (if the method is used within a property decorator, this value will be concatenated to an active field name)
	 *
	 * @param fields - declaration of object properties
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   bar: number = 0;
	 *
	 *   @field()
	 *   bad: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.object('links', [
	 *     'bla',
	 *     ['bar', 'barAlias'],
	 *     ['bad', String]
	 *   ]))
	 *
	 *   baz: {links: {bla: number; barAlias: number; bad: string}}}
	 * }
	 * ```
	 */
	object(path: LinkDecl, fields: ObjectPropLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties/events as links.
	 *
	 * The link is mean every time a value by the link is changed or linked event is fired
	 * a value that refers to the link will be also changed.
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 *
	 * @see [[iBlock.watch]]
	 * @param path - path to a property that contains the result object
	 *   (if the method is used within a property decorator, this value will be concatenated to an active field name)
	 *
	 * @param opts - additional options
	 * @param fields - declaration of object properties
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   bla: number = 0;
	 *
	 *   @field()
	 *   bar: number = 0;
	 *
	 *   @field()
	 *   bad: number = 0;
	 *
	 *   @field((ctx) => ctx.sync.object('links', {deep: true}, [
	 *     'bla',
	 *     ['bar', 'barAlias'],
	 *     ['bad', String]
	 *   ]))
	 *
	 *   baz: {links: {bla: number; barAlias: number; bad: string}}}
	 * }
	 * ```
	 */
	object(
		path: Link,
		opts: AsyncWatchOptions,
		fields: ObjectPropLinksDecl
	): Dictionary;

	object(
		path: LinkDecl | AsyncWatchOptions | ObjectPropLinksDecl,
		opts?: AsyncWatchOptions | ObjectPropLinksDecl,
		fields?: ObjectPropLinksDecl
	): Dictionary {
		if (Object.isString(path)) {
			if (Object.isArray(opts)) {
				fields = opts;
				opts = undefined;
			}

		} else {
			if (Object.isArray(path)) {
				fields = path;
				opts = undefined;

			} else {
				if (Object.isArray(opts)) {
					fields = opts;
				}

				opts = path;
			}

			path = '';
		}

		let
			head = this.activeField;

		if (head != null) {
			if (Object.isTruly(path)) {
				path = [head, path].join('.');

			} else {
				path = head;
			}

		} else {
			head = path;
			path = '';
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (head == null) {
			throw new Error('Path to a property that is contained the final object is not defined');
		}

		const {
			ctx,
			syncLinkCache,
			linksCache,
			meta: {hooks: {beforeDataCreate: hooks}}
		} = this;

		const
			tail = path.split('.').slice(1),
			obj = {};

		if (tail.length > 0) {
			Object.set(obj, tail, {});
		}

		const
			cursor = Object.get<StrictDictionary>(obj, tail);

		const merge = (...args) => Object.mixin({
			deep: true,
			extendFilter: (d, v) => Object.isDictionary(v)
		}, undefined, ...args);

		const setField = (path, val) => {
			const
				newObj = {};

			Object.set(newObj, path.split('.').slice(1), val);
			this.field.set(head!, merge(this.field.get(head!), newObj));

			return val;
		};

		const attachWatcher = (watchPath, tiedPath, getVal, clone?) => {
			Object.set(linksCache, tiedPath, true);

			const
				isCustomWatcher = customWatcherRgxp.test(watchPath),
				sync = (val?, oldVal?) => setField(tiedPath, getVal(val, oldVal));

			let
				info;

			if (!isCustomWatcher) {
				info = getPropertyInfo(watchPath, this.ctx);
			}

			const isAccessor = info != null ?
				Boolean(
					info.type === 'accessor' ||
					info.type === 'computed' ||
					info.accessor
				) :

				false;

			const
				isolatedOpts = <AsyncWatchOptions>{...opts};

			if (isAccessor) {
				isolatedOpts.immediate = isolatedOpts.immediate !== false;
			}

			if (clone === true) {
				ctx.watch(info ?? watchPath, isolatedOpts, (val, oldVal) => {
					if (isCustomWatcher) {
						oldVal = undefined;

					} else if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(tiedPath))) {
						return;
					}

					sync(val, oldVal);
				});

			} else {
				const
					that = this;

				ctx.watch(info ?? watchPath, isolatedOpts, (val, ...args) => {
					let
						oldVal;

					if (!isCustomWatcher) {
						oldVal = args[0];

						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, that.field.get(tiedPath))) {
							return;
						}
					}

					sync(val, oldVal);
				});
			}

			syncLinkCache.set(watchPath, Object.assign(syncLinkCache.get(watchPath) ?? {}, {
				[tiedPath]: {
					path: tiedPath,
					sync
				}
			}));

			if (this.lfc.isBeforeCreate('beforeDataCreate')) {
				hooks.push({fn: sync});
			}
		};

		for (let i = 0; i < fields!.length; i++) {
			const
				el = fields![i];

			if (Object.isArray(el)) {
				let
					wrapper,
					watchPath;

				if (el.length === 3) {
					watchPath = el[1];
					wrapper = el[2];

				} else if (Object.isFunction(el[1])) {
					watchPath = el[0];
					wrapper = el[1];

				} else {
					watchPath = el[1];
				}

				const
					tiedPath = [path, el[0]].join('.');

				if (Object.get(linksCache, tiedPath) == null) {
					const getVal = (val?, oldVal?) => {
						if (Object.isString(watchPath) && !customWatcherRgxp.test(watchPath)) {
							val = val !== undefined ? val : this.field.get(watchPath);
						}

						return wrapper != null ? wrapper.call(this.component, val, oldVal) : val;
					};

					attachWatcher(watchPath, tiedPath, getVal, wrapper?.length > 1);
					cursor[el[0]] = getVal();
				}

			} else {
				const
					tiedPath = [path, el].join('.');

				if (Object.get(linksCache, tiedPath) == null) {
					const getVal = (val?) => {
						if (customWatcherRgxp.test(el)) {
							return val;
						}

						return val !== undefined ? val : this.field.get(el);
					};

					attachWatcher(el, tiedPath, getVal);
					cursor[el] = getVal();
				}
			}
		}

		return obj;
	}

	/**
	 * Synchronizes component link values with values they are linked
	 *
	 * @param path - path to a property/event that we are referring or
	 *   [path to a property that contains a link, path to a property/event that we are referring]
	 *
	 * @param [value] - additional value for sync
	 */
	syncLinks(path?: LinkDecl, value?: unknown): void {
		let
			linkPath,
			storePath;

		if (Object.isArray(path)) {
			storePath = path[0];
			linkPath = path[1];

		} else {
			linkPath = path;
		}

		const
			cache = this.syncLinkCache;

		const sync = (linkName) => {
			const
				o = cache.get(linkName);

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

				if (storePath == null || key === storePath) {
					el.sync(value);
				}
			}
		};

		if (linkPath != null) {
			sync(linkPath);

		} else {
			for (let o = cache.keys(), el = o.next(); !el.done; el = o.next()) {
				sync(el.value);
			}
		}
	}

	/**
	 * Binds a modifier to a property by the specified path
	 *
	 * @param modName
	 * @param path
	 * @param [converter] - converter function
	 */
	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		converter?: ModValueConverter<this['C'], D, R>
	): void;

	/**
	 * Binds a modifier to a property by the specified path
	 *
	 * @param modName
	 * @param path
	 * @param opts - additional options
	 * @param [converter] - converter function
	 */
	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		opts: AsyncWatchOptions,
		converter?: ModValueConverter<this['C'], D, R>
	): void;

	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		optsOrConverter?: AsyncWatchOptions | ModValueConverter<this['C'], D, R>,
		converter: ModValueConverter<this['C'], D, R> = (v) => v != null ? Boolean(v) : undefined
	): void {
		modName = modName.camelize(false);

		let
			opts;

		if (Object.isFunction(optsOrConverter)) {
			converter = optsOrConverter;

		} else {
			opts = optsOrConverter;
		}

		const
			{ctx} = this;

		const setWatcher = () => {
			const wrapper = (val, ...args) => {
				val = converter.call(this.component, val, ...args);

				if (val !== undefined) {
					void this.ctx.setMod(modName, val);
				}
			};

			if (converter.length > 1) {
				ctx.watch(path, opts, (val, oldVal) => wrapper(val, oldVal));

			} else {
				ctx.watch(path, opts, wrapper);
			}
		};

		if (this.lfc.isBeforeCreate()) {
			const sync = () => {
				const
					v = converter.call(this.component, this.field.get(path));

				if (v !== undefined) {
					ctx.mods[modName] = String(v);
				}
			};

			this.syncModCache[modName] = sync;

			if (ctx.hook !== 'beforeDataCreate') {
				this.meta.hooks.beforeDataCreate.push({
					fn: sync
				});

			} else {
				sync();
			}

			setWatcher();

		} else if (statuses[ctx.componentStatus] >= 1) {
			setWatcher();
		}
	}
}
