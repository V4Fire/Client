/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isProxy } from 'core/object/watch';
import { customWatcherRgxp, getPropertyInfo, PropertyInfo } from 'super/i-block/i-block';

import type Sync from 'friends/sync/class';
import type { Link, PropLinks, AsyncWatchOptions } from 'friends/sync/interface';

/**
 * Creates a dictionary where all keys refer to other properties/events as links.
 *
 * Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
 * If the link is set to an event, then every time this event fires, then the value of A will change to the value of
 * the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
 * that will take parameters from the link and return the value to the original field.
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
 * import watch from 'core/object/watch';
 * import iBlock, { component, field } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = 0;
 *
 *   @field()
 *   bla: Dictionary = {a: {b: 1}};
 *
 *   @field()
 *   bar: number = 0;
 *
 *   @field((ctx) => ctx.sync.object([
 *     'foo',
 *     ['blaAlias', 'bla.a.b'],
 *     ['bar', String],
 *     ['baz', 'document:click', (e) => e.pageY]
 *   ]))
 *
 *   baz!: {foo: number; blaAlias: number; bar: string; baz: number};
 * }
 * ```
 */
export function object(this: Sync, decl: PropLinks): Dictionary;

/**
 * Creates a dictionary where all keys refer to other properties/events as links.
 *
 * Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
 * If the link is set to an event, then every time this event fires, then the value of A will change to the value of
 * the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
 * that will take parameters from the link and return the value to the original field.
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
 * import watch from 'core/object/watch';
 * import iBlock, { component, prop, field } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = 0;
 *
 *   @field()
 *   bla: Dictionary = {a: {b: 1}};
 *
 *   @field()
 *   bar: number = 0;
 *
 *   @field((ctx) => ctx.sync.object({deep: true}, [
 *     'foo',
 *     ['blaAlias', (value, oldValue?) => value.a.b],
 *     ['bar', String],
 *     ['baz', 'document:click', (e) => e.pageY]
 *   ]))
 *
 *   baz!: {foo: number; blaAlias: number; bar: string; baz: number};
 * }
 * ```
 */
export function object(this: Sync, opts: AsyncWatchOptions, fields: PropLinks): Dictionary;

/**
 * Creates a dictionary where all keys refer to other properties/events as links.
 *
 * Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
 * If the link is set to an event, then every time this event fires, then the value of A will change to the value of
 * the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
 * that will take parameters from the link and return the value to the original field.
 *
 * To listen an event you need to use the special delimiter ":" within a path.
 * Also, you can specify an event emitter to listen by writing a link before ":".
 *
 * @see [[iBlock.watch]]
 * @param path - a path to the property that contains the result object
 *   (if the method is used within a property decorator, this value will be attached to the name of the active field)
 *
 * @param fields - declaration of object properties
 *
 * @example
 * ```typescript
 * import watch from 'core/object/watch';
 * import iBlock, { component, prop, field } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = 0;
 *
 *   @field()
 *   bla: Dictionary = {a: {b: 1}};
 *
 *   @field()
 *   bar: number = 0;
 *
 *   @field((ctx) => ctx.sync.object('links', [
 *     'foo',
 *     ['blaAlias', 'bla.a.b'],
 *     ['bar', String],
 *     ['baz', 'document:click', (e) => e.pageY]
 *   ]))
 *
 *   baz: {links: {foo: number; blaAlias: number; bar: string; baz: number}}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function object(this: Sync, path: Link, fields: PropLinks): Dictionary;

/**
 * Creates a dictionary where all keys refer to other properties/events as links.
 *
 * Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
 * If the link is set to an event, then every time this event fires, then the value of A will change to the value of
 * the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
 * that will take parameters from the link and return the value to the original field.
 *
 * To listen an event you need to use the special delimiter ":" within a path.
 * Also, you can specify an event emitter to listen by writing a link before ":".
 *
 * @see [[iBlock.watch]]
 * @param path - a path to the property that contains the result object
 *   (if the method is used within a property decorator, this value will be attached to the name of the active field)
 *
 * @param opts - additional options
 * @param fields - declaration of object properties
 *
 * @example
 * ```typescript
 * import watch from 'core/object/watch';
 * import iBlock, { component, prop, field } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = 0;
 *
 *   @field()
 *   bla: Dictionary = {a: {b: 1}};
 *
 *   @field()
 *   bar: number = 0;
 *
 *   @field((ctx) => ctx.sync.object('links', {deep: true}, [
 *     'foo',
 *     ['blaAlias', (value, oldValue?) => value.a.b],
 *     ['bar', String],
 *     ['baz', 'document:click', (e) => e.pageY]
 *   ]))
 *
 *   baz: {links: {foo: number; blaAlias: number; bar: string; baz: number}}}
 * }
 * ```
 */
export function object(
	this: Sync,
	path: Link,
	opts: AsyncWatchOptions,
	fields: PropLinks
): Dictionary;

export function object(
	this: Sync,
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
		throw new ReferenceError('The path to the property contained in the final object is not defined');
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

	const attachWatcher = (watchPath, destPath, getVal, getter?) => {
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

		if (getter != null && (getter.length > 1 || getter['originalLength'] > 1)) {
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

		const createGetVal = (watchPath, getter) => (val?, oldVal?, init?: boolean) => {
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

			if (getter == null) {
				return val;
			}

			return getter.call(this.component, val, oldVal);
		};

		let
			getter,
			watchPath,
			savePath;

		if (Object.isArray(el)) {
			if (el.length === 3) {
				watchPath = el[1];
				getter = el[2];

			} else if (Object.isFunction(el[1])) {
				watchPath = el[0];
				getter = el[1];

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
			const getVal = createGetVal(watchPath, getter);
			[type, opts, info] = attachWatcher(watchPath, destPath, getVal);
			Object.set(cursor, savePath, getVal(null, null, true));
		}
	}

	this.field.set(path, cursor);
	return resObj;
}
