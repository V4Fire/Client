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
	PropLinks,

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
		path: LinkDecl,
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
		path: LinkDecl,
		opts: AsyncWatchOptions,
		wrapper?: LinkWrapper<this['C'], D, R>
	): CanUndef<R>;

	link<D = unknown, R = D>(
		path?: LinkDecl | AsyncWatchOptions | LinkWrapper<this['C'], D>,
		opts?: AsyncWatchOptions | LinkWrapper<this['C'], D>,
		wrapper?: LinkWrapper<this['C'], D>
	): CanUndef<R> {
		let
			destPath;

		if (Object.isArray(path)) {
			destPath = path[0];
			path = path[1];

		} else {
			destPath = this.activeField;
		}

		if (destPath == null) {
			throw new Error('Path to the property that is contained a link is not defined');
		}

		const {
			meta,
			ctx,
			linksCache,
			syncLinkCache
		} = this;

		if (linksCache[destPath]) {
			return;
		}

		let
			info,
			isMountedWatcher = false,
			isCustomWatcher = false;

		if (path == null || !Object.isString(path)) {
			if (isProxy(path)) {
				isMountedWatcher = true;
				info = {ctx: path};
				path = undefined;

			} else if (isProxy((<any>path)?.ctx)) {
				isMountedWatcher = true;
				info = path;
				path = info.path;

			} else {
				wrapper = <LinkWrapper<this['C'], D>>opts;
				opts = path;
				path = `${destPath.replace(bindingRgxp, '')}Prop`;
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

		const
			resolvedOpts = opts ?? {};

		if (info?.type === 'mounted') {
			isMountedWatcher = true;
			path = info.path;
		}

		const isAccessor = info != null ?
			Boolean(
				info.type === 'accessor' ||
				info.type === 'computed' ||
				info.accessor
			) :

			false;

		if (isAccessor) {
			resolvedOpts.immediate = resolvedOpts.immediate !== false;
		}

		linksCache[destPath] = {};

		const sync = (val?, oldVal?) => {
			const res = wrapper ? wrapper.call(this.component, val, oldVal) : val;
			this.field.set(destPath, res);
			return res;
		};

		if (Object.size(wrapper) > 1) {
			ctx.watch(info ?? path, resolvedOpts, (val, oldVal) => {
				if (isCustomWatcher) {
					oldVal = undefined;

				} else if (this.fastCompare(val, oldVal, destPath, resolvedOpts)) {
					return;
				}

				sync(val, oldVal);
			});

		} else {
			ctx.watch(info ?? path, resolvedOpts, (val, ...args) => {
				let
					oldVal;

				if (!isCustomWatcher) {
					oldVal = args[0];

					if (this.fastCompare(val, oldVal, destPath, resolvedOpts)) {
						return;
					}
				}

				sync(val, oldVal);
			});
		}

		{
			let
				key;

			if (isMountedWatcher) {
				const o = info?.originalPath;
				key = Object.isString(o) ? o : info?.ctx ?? path;

			} else {
				key = path;
			}

			syncLinkCache.set(key, Object.assign(syncLinkCache.get(key) ?? {}, {
				[destPath]: {
					path: destPath,
					sync
				}
			}));
		}

		if (isCustomWatcher) {
			return sync();
		}

		if (isMountedWatcher) {
			const
				obj = info?.ctx;

			if (Object.size(path) > 0) {
				return sync(Object.get(obj, <any>path));
			}

			return sync(obj);
		}

		const
			initSync = () => sync(this.field.get(info != null ? info.originalPath : path));

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

			hooks.splice(pos, 0, {fn: initSync, name});
			return;
		}

		return initSync();
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
	object(decl: PropLinks): Dictionary;

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
	object(opts: AsyncWatchOptions, fields: PropLinks): Dictionary;

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
	object(path: Link, fields: PropLinks): Dictionary;

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
		fields: PropLinks
	): Dictionary;

	object(
		path: Link | AsyncWatchOptions | PropLinks,
		opts?: AsyncWatchOptions | PropLinks,
		fields?: PropLinks
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
			destHead = this.activeField;

		if (destHead != null) {
			if (Object.size(path) > 0) {
				path = [destHead, path].join('.');

			} else {
				path = destHead;
			}

		} else {
			destHead = path.split('.')[0];
		}

		const
			localPath = path.split('.').slice(1);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (destHead == null) {
			throw new ReferenceError('Path to a property that is contained the final object is not defined');
		}

		const {
			ctx,
			syncLinkCache,
			linksCache,
			meta: {hooks: {beforeDataCreate: hooks}}
		} = this;

		const
			resObj = {};

		if (!Object.isArray(fields)) {
			return resObj;
		}

		if (localPath.length > 0) {
			Object.set(resObj, localPath, {});
		}

		const
			cursor = Object.get<StrictDictionary>(resObj, localPath);

		const merge = (...args) => Object.mixin({
			deep: true,
			extendFilter: (d, v) => Object.isDictionary(v)
		}, undefined, ...args);

		const setField = (path, val) => {
			if (destHead == null) {
				return val;
			}

			const
				localPath = path.split('.').slice(1);

			let
				newObj;

			if (localPath.length > 0) {
				newObj = {};
				Object.set(newObj, localPath, val);

			} else {
				newObj = val;
			}

			this.field.set(destHead, merge(this.field.get(destHead), newObj));
			return val;
		};

		const attachWatcher = (watchPath, destPath, getVal, clone?) => {
			Object.set(linksCache, destPath, true);

			let
				info,
				isMountedWatcher = false,
				isCustomWatcher = false;

			if (!Object.isString(watchPath)) {
				if (isProxy(watchPath)) {
					isMountedWatcher = true;
					info = {ctx: watchPath};
					watchPath = undefined;

				} else if (isProxy(watchPath?.ctx)) {
					isMountedWatcher = true;
					info = watchPath;
					watchPath = info.path;
				}

			} else if (!customWatcherRgxp.test(watchPath)) {
				info = getPropertyInfo(watchPath, this.ctx);

			} else {
				isCustomWatcher = true;
			}

			if (info?.type === 'mounted') {
				isMountedWatcher = true;
				watchPath = info.path;
			}

			const isAccessor = info != null ?
				Boolean(
					info.type === 'accessor' ||
					info.type === 'computed' ||
					info.accessor
				) :

				false;

			const
				sync = (val?, oldVal?, init?) => setField(destPath, getVal(val, oldVal, init)),
				isolatedOpts = <AsyncWatchOptions>{...opts};

			if (isAccessor) {
				isolatedOpts.immediate = isolatedOpts.immediate !== false;
			}

			if (clone === true) {
				ctx.watch(info ?? watchPath, isolatedOpts, (val, oldVal) => {
					if (isCustomWatcher) {
						oldVal = undefined;

					} else if (this.fastCompare(val, oldVal, destPath, isolatedOpts)) {
						return;
					}

					sync(val, oldVal);
				});

			} else {
				ctx.watch(info ?? watchPath, isolatedOpts, (val, ...args) => {
					let
						oldVal;

					if (!isCustomWatcher) {
						oldVal = args[0];

						if (this.fastCompare(val, oldVal, destPath, isolatedOpts)) {
							return;
						}
					}

					sync(val, oldVal);
				});
			}

			{
				let
					key;

				if (isMountedWatcher) {
					const o = info?.originalPath;
					key = Object.isString(o) ? o : info?.ctx ?? watchPath;

				} else {
					key = watchPath;
				}

				syncLinkCache.set(key, Object.assign(syncLinkCache.get(key) ?? {}, {
					[destPath]: {
						path: destPath,
						sync
					}
				}));
			}

			if (isCustomWatcher) {
				return ['custom'];
			}

			if (isMountedWatcher) {
				return ['mounted', info];
			}

			if (this.lfc.isBeforeCreate('beforeDataCreate')) {
				hooks.push({fn: () => sync(null, null, true)});
			}

			return ['regular', info];
		};

		for (let i = 0; i < fields.length; i++) {
			const
				el = fields[i];

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
					savePath = el[0],
					destPath = [path, savePath].join('.');

				if (Object.get(linksCache, destPath) == null) {
					// eslint-disable-next-line prefer-const
					let type, info;

					const getVal = (val?, oldVal?, init?: boolean) => {
						if (init) {
							switch (type) {
								case 'regular':
									val = this.field.get(watchPath);
									break;

								case 'mounted': {
									const
										obj = info.ctx;

									if (Object.size(info.path) > 0) {
										val = Object.get(obj, info.path);

									} else {
										val = obj;
									}

									break;
								}

								default:
									val = undefined;
									break;
							}
						}

						if (wrapper == null) {
							return val;
						}

						return wrapper.call(this.component, val, oldVal);
					};

					[type, info] =
						attachWatcher(watchPath, destPath, getVal, Object.size(wrapper) > 1);

					Object.set(cursor, savePath, getVal(null, null, true));
				}

			} else {
				const
					savePath = el,
					destPath = [path, savePath].join('.');

				if (Object.get(linksCache, destPath) == null) {
					// eslint-disable-next-line prefer-const
					let type;

					const getVal = (val?, oldVal?, init?: boolean) => {
						if (init) {
							return type === 'regular' ? this.field.get(el) : undefined;
						}

						return val;
					};

					[type] =
						attachWatcher(el, destPath, getVal);

					Object.set(cursor, savePath, getVal(null, null, true));
				}
			}
		}

		return resObj;
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

	/**
	 * Wrapper of `Object.fastCompare` to compare watchable values
	 *
	 * @param value
	 * @param oldValue
	 * @param destPath - path to the property
	 * @param opts - watch options
	 */
	protected fastCompare(
		value: unknown,
		oldValue: unknown,
		destPath: string,
		opts: AsyncWatchOptions
	): boolean {
		return !opts.withProto && (
			Object.fastCompare(value, oldValue) ||
			Object.fastCompare(value, this.field.get(destPath))
		);
	}
}
