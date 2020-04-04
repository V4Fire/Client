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

import { bindingRgxp, SyncLinkCache } from 'core/component';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';
import { statuses } from 'super/i-block/const';

import {

	LinkDecl,
	LinkWrapper,
	ObjectLinksDecl,
	ModValueConverter,
	AsyncWatchOptions

} from 'super/i-block/modules/sync/interface';

export * from 'super/i-block/modules/sync/interface';

/**
 * Class that provides API to organize a "link" from one component property to another
 */
export default class Sync<C extends iBlock = iBlock> extends Friend<C> {
	/**
	 * Cache for modifier synchronize functions
	 */
	readonly syncModCache!: Dictionary<Function>;

	/** @see [[iBlock.$activeField]] */
	protected get activeField(): CanUndef<string> {
		return this.component.$activeField;
	}

	/** @see [[iBlock.$syncLinkCache]] */
	protected get syncLinkCache(): SyncLinkCache {
		return this.component.$syncLinkCache;
	}

	/** @see [[iBlock.$syncLinkCache]] */
	protected set syncLinkCache(value: SyncLinkCache) {
		// @ts-ignore
		// tslint:disable:no-string-literal
		this.component['$syncLinkCache'] = value;
	}

	/**
	 * Cache for links
	 */
	protected readonly linksCache!: Dictionary<Dictionary>;

	/** @override */
	constructor(component: C) {
		super(component);
		this.linksCache = Object.createDict();
		this.syncLinkCache = Object.createDict();
		this.syncModCache = Object.createDict();
	}

	/**
	 * Sets a link to a property that logically connected to the current.
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
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
	link<D = unknown, R = D>(optsOrWrapper?: AsyncWatchOptions | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * Sets a link to a property that logically connected to the current.
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
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
	link<D = unknown, R = D>(opts: AsyncWatchOptions, wrapper?: LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * Sets a link to a property by the specified path.
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * @param path - path to property that we are referring or
	 *   [path to property that contains a link, path to property that we are referring]
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
	 *   created() {
	 *     this.baz = this.sync.link(['baz', 'bla']);
	 *   }
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(path: LinkDecl, optsOrWrapper?: AsyncWatchOptions | LinkWrapper<D, R>): CanUndef<R>;

	/**
	 * Sets a link to a property by the specified path.
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * @param path - path to property that we are referring or
	 *   [path to property that contains a link, path to property that we are referring]
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
	 *   created() {
	 *     this.baz = this.sync.link(['baz', 'bla'], {deep: true}, (val) => val + 1));
	 *   }
	 * }
	 * ```
	 */
	link<D = unknown, R = D>(path: LinkDecl, opts: AsyncWatchOptions, wrapper?: LinkWrapper<D, R>): CanUndef<R>;
	link<D = unknown, R = D>(
		path?: LinkDecl | AsyncWatchOptions | LinkWrapper<D>,
		opts?: AsyncWatchOptions | LinkWrapper<D>,
		wrapper?: LinkWrapper<D>
	): CanUndef<R> {
		let
			head;

		if (Object.isArray(path)) {
			head = path[0];
			path = path[1];

		} else {
			head = this.activeField;
		}

		if (!head) {
			throw new Error('Path to a property that is contained a link is not defined');
		}

		const {
			meta,
			component,
			linksCache,
			syncLinkCache,
			component: {$options: {propsData}}
		} = this;

		if (linksCache[head]) {
			return;
		}

		let
			isProp,
			isAccessor;

		if (!path || !Object.isString(path)) {
			wrapper = <LinkWrapper<D>>opts;
			opts = <AsyncWatchOptions>path;
			path = `${head.replace(bindingRgxp, '')}Prop`;
			isProp = true;

		} else {
			isProp = Boolean(meta.props[path]);

			if (!isProp) {
				isAccessor = Boolean(meta.accessors[path] || meta.computedFields[path]);
			}
		}

		if (Object.isFunction(opts)) {
			wrapper = opts;
			opts = {};
		}

		opts = opts || {};

		if (isAccessor) {
			opts.immediate = opts.immediate !== false;
		}

		linksCache[head] = {};

		const sync = (val?, oldVal?) => {
			val = val !== undefined ? val : this.field.get(<string>path);

			const
				res = wrapper ? wrapper.call(this, val, oldVal) : val;

			this.field.set(head, res);
			return res;
		};

		const canWatch = !component.isFlyweight && (
			component.isFunctional ?
				!isProp :
				!isProp || !propsData || path in propsData
		);

		if (canWatch) {
			if (wrapper && wrapper.length > 1) {
				component.watch(path, (val, oldVal) => {
					if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(head))) {
						return;
					}

					sync(val, oldVal);
				}, opts);

			} else {
				const
					that = this;

				// tslint:disable-next-line:only-arrow-functions
				component.watch(path, function (val?: unknown): void {
					const
						oldVal = arguments[1];

					if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, that.field.get(head))) {
						return;
					}

					sync(val, oldVal);
				}, opts);
			}
		}

		// tslint:disable-next-line:prefer-object-spread
		syncLinkCache[path] = Object.assign(syncLinkCache[path] || {}, {
			[head]: {
				path: head,
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

	/**
	 * Creates an object where all keys are referring to another properties as links.
	 *
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * Mind, this method can be used only within a property decorator.
	 *
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
	object(decl: ObjectLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties as links.
	 *
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * Mind, this method can be used only within a property decorator.
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
	object(opts: AsyncWatchOptions, fields: ObjectLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties as links.
	 *
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * @param path - path to property that contains the result object
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
	// tslint:disable-next-line:unified-signatures
	object(path: LinkDecl, fields: ObjectLinksDecl): Dictionary;

	/**
	 * Creates an object where all keys refer to another properties as links.
	 *
	 * The link is mean that every time the value by a link is changed
	 * the value that refers to the link will be also changed.
	 *
	 * @param path - path to property that contains the result object
	 *   (if the method is used within a property decorator, this value will be concatenated to an active field name)
	 *
	 * @param opts - additional options
	 * @param fields - declaration of object properties
	 *
	 * * @example
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
		path: string,
		opts: AsyncWatchOptions,
		fields: ObjectLinksDecl
	): Dictionary;

	object(
		path: string | AsyncWatchOptions | ObjectLinksDecl,
		opts?: AsyncWatchOptions | ObjectLinksDecl,
		fields?: ObjectLinksDecl
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
				fields = <ObjectLinksDecl>opts;
				opts = path;
			}

			path = '';
		}

		let
			head = this.activeField;

		if (head) {
			// tslint:disable-next-line:prefer-conditional-expression
			if (path) {
				path = [head, path].join('.');

			} else {
				path = head;
			}

		} else {
			head = path;
			path = '';
		}

		if (!head) {
			throw new Error('Path to a property that is contained the final object is not defined');
		}

		const {
			meta,
			component,
			syncLinkCache,
			linksCache,
			meta: {hooks: {beforeDataCreate: hooks}},
			component: {$options: {propsData}}
		} = this;

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
			extendFilter: (d, v) => Object.isDictionary(v)
		}, undefined, ...args);

		const setField = (path, val) => {
			const
				newObj = {};

			Object.set(newObj, path.split('.').slice(1), val);
			this.field.set(head!, merge(this.field.get(head!), newObj));

			return val;
		};

		const attachWatcher = (field, path, getVal, clone?) => {
			Object.set(linksCache, path, true);

			const
				sync = (val?, oldVal?) => setField(path, getVal(val, oldVal)),
				isProp = meta.props[field];

			let
				isAccessor;

			if (!isProp) {
				isAccessor = Boolean(meta.accessors[field] || meta.computedFields[field]);
			}

			const
				p = <AsyncWatchOptions>{...opts};

			if (isAccessor) {
				p.immediate = p.immediate !== false;
			}

			const canWatch = !component.isFlyweight && (
				component.isFunctional ?
					!isProp :
					!isProp || !propsData || field in propsData
			);

			if (canWatch) {
				if (clone) {
					component.watch(field, (val, oldVal) => {
						if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.field.get(path))) {
							return;
						}

						sync(val, oldVal);
					}, p);

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
					}, p);
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

		for (let i = 0; i < fields!.length; i++) {
			const
				el = fields![i];

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
	 * Synchronizes component link values with values they are linked
	 *
	 * @param path - path to property that we are referring or
	 *   [path to property that contains a link, path to property that we are referring]
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

				if (!storePath || key === storePath) {
					el.sync(value);
				}
			}
		};

		if (linkPath) {
			sync(linkPath);

		} else {
			for (let keys = Object.keys(cache), i = 0; i < keys.length; i++) {
				sync(keys[i]);
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
		converter?: ModValueConverter<D, R>
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
		converter?: ModValueConverter<D, R>
	): void;

	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		optsOrConverter?: AsyncWatchOptions | ModValueConverter<D, R>,
		converter: ModValueConverter<D, R> = (v) => v != null ? Boolean(v) : undefined
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
			{component} = this;

		const setWatcher = () => {
			const wrapper = (val, ...args) => {
				val = converter.call(this, val, ...args);

				if (val !== undefined) {
					this.component.setMod(modName, val);
				}
			};

			if (converter.length > 1) {
				// tslint:disable-next-line:no-unnecessary-callback-wrapper
				component.watch(path, (val, oldVal) => wrapper(val, oldVal), opts);

			} else {
				component.watch(path, wrapper, opts);
			}
		};

		if (this.lfc.isBeforeCreate()) {
			const sync = this.syncModCache[modName] = () => {
				const
					v = converter.call(this, this.field.get(path));

				if (v !== undefined) {
					component.mods[modName] = String(v);
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
