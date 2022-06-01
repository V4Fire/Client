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
import {

	bindingRgxp,
	customWatcherRgxp,
	getPropertyInfo,

	PropertyInfo,
	SyncLinkCache

} from 'core/component';

import type iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/const';

import Friend from 'friends/friend';

import type {

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

	constructor(component: iBlock) {
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
	 * Logical connection is based on a name convention: properties that match the pattern
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
	 * properties that match the pattern "${property} -> ${property}Prop" are connected with each other.
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
			destPath,
			resolvedPath: CanUndef<LinkDecl>;

		if (Object.isArray(path)) {
			destPath = path[0];
			path = path[1];

		} else {
			destPath = this.activeField;

			if (Object.isFunction(path)) {
				wrapper = path;
				path = undefined;
			}
		}

		if (Object.isFunction(opts)) {
			wrapper = opts;
		}

		if (destPath == null) {
			throw new Error('A path to the property that is contained a link is not defined');
		}

		const {
			meta,
			ctx,
			linksCache,
			syncLinkCache
		} = this;

		if (linksCache[destPath] != null) {
			return;
		}

		let
			resolvedOpts: AsyncWatchOptions = {};

		if (path == null) {
			resolvedPath = `${destPath.replace(bindingRgxp, '')}Prop`;

		} else if (Object.isString(path) || isProxy(path) || 'ctx' in path) {
			resolvedPath = path;

		} else if (Object.isDictionary(path)) {
			resolvedOpts = path;
		}

		if (Object.isDictionary(opts)) {
			resolvedOpts = opts;
		}

		if (resolvedPath == null) {
			throw new ReferenceError('A path or object to watch is not specified');
		}

		let
			info,
			normalizedPath: CanUndef<ObjectPropertyPath>,
			topPathIndex = 1;

		let
			isMountedWatcher = false,
			isCustomWatcher = false;

		if (!Object.isString(resolvedPath)) {
			isMountedWatcher = true;

			if (isProxy(resolvedPath)) {
				info = {ctx: resolvedPath};
				normalizedPath = undefined;

			} else {
				info = resolvedPath;
				normalizedPath = info.path;
				topPathIndex = 0;
			}

		} else {
			normalizedPath = resolvedPath;

			if (RegExp.test(customWatcherRgxp, normalizedPath)) {
				isCustomWatcher = true;

			} else {
				info = getPropertyInfo(normalizedPath, this.ctx);

				if (info.type === 'mounted') {
					isMountedWatcher = true;
					normalizedPath = info.path;
					topPathIndex = Object.size(info.path) > 0 ? 0 : 1;
				}
			}
		}

		const isAccessor = info != null ?
			Boolean(info.type === 'accessor' || info.type === 'computed' || info.accessor) :
			false;

		if (isAccessor) {
			resolvedOpts.immediate = resolvedOpts.immediate !== false;
		}

		if (!isCustomWatcher) {
			if (
				normalizedPath != null && (
					Object.isArray(normalizedPath) && normalizedPath.length > topPathIndex ||
					Object.isString(normalizedPath) && normalizedPath.split('.', 2).length > topPathIndex
				)
			) {
				if (!resolvedOpts.deep && !resolvedOpts.collapse) {
					resolvedOpts.collapse = false;
				}

			} else if (resolvedOpts.deep !== false && resolvedOpts.collapse !== false) {
				resolvedOpts.deep = true;
				resolvedOpts.collapse = true;
			}
		}

		linksCache[destPath] = {};

		const sync = (val?, oldVal?) => {
			const res = wrapper ? wrapper.call(this.component, val, oldVal) : val;
			this.field.set(destPath, res);
			return res;
		};

		if (wrapper != null && (wrapper.length > 1 || wrapper['originalLength'] > 1)) {
			ctx.watch(info ?? normalizedPath, resolvedOpts, (val, oldVal, ...args) => {
				if (isCustomWatcher) {
					oldVal = undefined;

				} else {
					if (args.length === 0 && Object.isArray(val) && val.length > 0) {
						const
							mutation = <[unknown, unknown]>val[val.length - 1];

						val = mutation[0];
						oldVal = mutation[1];
					}

					if (this.fastCompare(val, oldVal, destPath, resolvedOpts)) {
						return;
					}
				}

				sync(val, oldVal);
			});

		} else {
			ctx.watch(info ?? normalizedPath, resolvedOpts, (val, ...args) => {
				let
					oldVal: unknown = undefined;

				if (!isCustomWatcher) {
					if (args.length === 0 && Object.isArray(val) && val.length > 0) {
						const
							mutation = <[unknown, unknown]>val[val.length - 1];

						val = mutation[0];
						oldVal = mutation[1];

					} else {
						oldVal ??= args[0];
					}

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
				key = Object.isString(o) ? o : info?.ctx ?? normalizedPath;

			} else {
				key = normalizedPath;
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

		const
			needCollapse = resolvedOpts.collapse !== false;

		if (isMountedWatcher) {
			const
				obj = info?.ctx;

			if (needCollapse || Object.size(normalizedPath) === 0) {
				return sync(obj);
			}

			return sync(Object.get(obj, normalizedPath!));
		}

		const initSync = () => sync(
			this.field.get(needCollapse ? info.originalTopPath : info.originalPath)
		);

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
	 *     ['barAlias', 'bar'],
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
	 *     ['barAlias', 'bar'],
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
	 *     ['barAlias', 'bar'],
	 *     ['bad', String]
	 *   ]))
	 *
	 *   baz: {links: {bla: number; barAlias: number; bad: string}}}
	 * }
	 * ```
	 */
	// eslint-disable-next-line @typescript-eslint/unified-signatures
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
	 *     ['barAlias', 'bar'],
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
			destHead = path.split('.', 1)[0];
		}

		const
			localPath = path.split('.').slice(1);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (destHead == null) {
			throw new ReferenceError('A path to a property that is contained the final object is not defined');
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

		const attachWatcher = (watchPath, destPath, getVal, wrapper?) => {
			Object.set(linksCache, destPath, true);

			let
				info,
				isMountedWatcher = false,
				isCustomWatcher = false,
				topPathIndex = 1;

			if (!Object.isString(watchPath)) {
				isMountedWatcher = true;

				if (isProxy(watchPath)) {
					info = {ctx: watchPath};
					watchPath = undefined;

				} else {
					info = watchPath;
					watchPath = info.path;
					topPathIndex = 0;
				}

			} else if (RegExp.test(customWatcherRgxp, watchPath)) {
				isCustomWatcher = true;

			} else {
				info = getPropertyInfo(watchPath, this.ctx);

				if (info.type === 'mounted') {
					isMountedWatcher = true;
					watchPath = info.path;
					topPathIndex = Object.size(info.path) > 0 ? 0 : 1;
				}
			}

			const isAccessor = info != null ?
				Boolean(info.type === 'accessor' || info.type === 'computed' || info.accessor) :
				false;

			const
				sync = (val?, oldVal?, init?) => this.field.set(destPath, getVal(val, oldVal, init)),
				isolatedOpts = <AsyncWatchOptions>{...opts};

			if (isAccessor) {
				isolatedOpts.immediate = isolatedOpts.immediate !== false;
			}

			if (!isCustomWatcher) {
				if (
					watchPath != null && (
						Object.isArray(watchPath) && watchPath.length > topPathIndex ||
						Object.isString(watchPath) && watchPath.split('.', 2).length > topPathIndex
					)
				) {
					if (!isolatedOpts.deep && !isolatedOpts.collapse) {
						isolatedOpts.collapse = false;
					}

				} else if (isolatedOpts.deep !== false && isolatedOpts.collapse !== false) {
					isolatedOpts.deep = true;
					isolatedOpts.collapse = true;
				}
			}

			if (wrapper != null && (wrapper.length > 1 || wrapper['originalLength'] > 1)) {
				ctx.watch(info ?? watchPath, isolatedOpts, (val, oldVal, ...args) => {
					if (isCustomWatcher) {
						oldVal = undefined;

					} else {
						if (args.length === 0 && Object.isArray(val) && val.length > 0) {
							const
								mutation = <[unknown, unknown]>val[val.length - 1];

							val = mutation[0];
							oldVal = mutation[1];
						}

						if (this.fastCompare(val, oldVal, destPath, isolatedOpts)) {
							return;
						}
					}

					sync(val, oldVal);
				});

			} else {
				ctx.watch(info ?? watchPath, isolatedOpts, (val, ...args) => {
					let
						oldVal: unknown = undefined;

					if (!isCustomWatcher) {
						if (args.length === 0 && Object.isArray(val) && val.length > 0) {
							const
								mutation = <[unknown, unknown]>val[val.length - 1];

							val = mutation[0];
							oldVal = mutation[1];

						} else {
							oldVal ??= args[0];
						}

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
				return ['custom', isolatedOpts];
			}

			if (isMountedWatcher) {
				return ['mounted', isolatedOpts, info];
			}

			if (this.lfc.isBeforeCreate('beforeDataCreate')) {
				hooks.push({fn: () => sync(null, null, true)});
			}

			return ['regular', isolatedOpts, info];
		};

		for (let i = 0; i < fields.length; i++) {
			const
				el = fields[i];

			let
				type: string,
				opts: AsyncWatchOptions,
				info: PropertyInfo;

			const createGetVal = (watchPath, wrapper) => (val?, oldVal?, init?: boolean) => {
				if (init) {
					switch (type) {
						case 'regular':
							val = this.field.get(opts.collapse ? info.originalTopPath : watchPath);
							break;

						case 'mounted': {
							const
								obj = info.ctx;

							if (opts.collapse || Object.size(info.path) === 0) {
								val = obj;

							} else {
								val = Object.get(obj, info.path);
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

			let
				wrapper,
				watchPath,
				savePath;

			if (Object.isArray(el)) {
				if (el.length === 3) {
					watchPath = el[1];
					wrapper = el[2];

				} else if (Object.isFunction(el[1])) {
					watchPath = el[0];
					wrapper = el[1];

				} else {
					watchPath = el[1];
				}

				savePath = el[0];

			} else {
				watchPath = el;
				savePath = el;
			}

			const
				destPath = [path, savePath].join('.');

			if (Object.get(linksCache, destPath) == null) {
				const getVal = createGetVal(watchPath, wrapper);
				[type, opts, info] = attachWatcher(watchPath, destPath, getVal);
				Object.set(cursor, savePath, getVal(null, null, true));
			}
		}

		this.field.set(path, cursor);
		return resObj;
	}

	/**
	 * Synchronizes component link values with values they are linked
	 *
	 * @param path - path to a property/event that we are referring or
	 *   [path to a property that contains a link, path to a property/event that we are referring]
	 *
	 * @param [value] - value to synchronize links
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

			if (o == null) {
				return;
			}

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el == null) {
					continue;
				}

				if (storePath == null || key === storePath) {
					el.sync(value ?? this.field.get(linkName));
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
		if (opts.collapse === false) {
			return value === oldValue;
		}

		return !opts.withProto && (
			Object.fastCompare(value, oldValue) &&
			Object.fastCompare(value, this.field.get(destPath))
		);
	}
}
