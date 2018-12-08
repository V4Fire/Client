/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');

import symbolGenerator from 'core/symbol';
import Async, { AsyncOpts, ClearOptsId, WrappedFunction, ProxyCb } from 'core/async';
import log, { LogMessageOptions } from 'core/log';

import * as analytics from 'core/analytics';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import 'super/i-block/directives';
import Daemons, { DaemonsDict } from 'super/i-block/modules/daemons';
import Block from 'super/i-block/modules/block';
import Cache from 'super/i-block/modules/cache';

import { statuses } from 'super/i-block/modules/const';
import { icons, iconsMap } from 'super/i-block/modules/icons';

import {

	Classes,
	WatchObjectFields,
	SizeTo,
	SyncLinkCache,
	ModsTable,
	ModsNTable,
	Statuses,
	LinkWrapper,
	WaitStatusOpts,
	ParentMessage,
	AsyncTaskId,
	AsyncTaskObjectId,
	AsyncTaskSimpleId,
	AsyncQueueType,
	AsyncWatchOpts,
	RemoteEvent,
	Event,
	ConverterCallType,
	Stage,
	BindModCb

} from 'super/i-block/modules/interface';

import iStaticPage from 'super/i-static-page/i-static-page';
import bRouter, { CurrentPage } from 'base/b-router/b-router';
import { asyncLocal, AsyncNamespace } from 'core/kv-storage';
import {

	component,
	PARENT,

	globalEvent,
	customWatcherRgxp,

	hook,
	runHook,
	Hooks,

	patchVNode,
	execRenderObject,

	ModVal,
	ModsDecl,

	ComponentInterface,
	ComponentElement,
	ComponentMeta,

	RenderObject,
	RenderContext,
	VNode

} from 'core/component';

import { prop, field, system, watch, wait, p, MethodWatchers } from 'super/i-block/modules/decorators';
import { queue, backQueue, restart, deferRestart } from 'core/render';
import { delegate } from 'core/dom';

import * as helpers from 'core/helpers';
import * as browser from 'core/browser';

export * from 'core/component';
export * from 'super/i-block/modules/interface';
export * from 'super/i-block/modules/daemons';

export { statuses, Cache };
export {

	p,
	prop,
	field,
	system,
	watch,
	wait,
	bindModTo,
	mod,
	removeMod,
	elMod,
	removeElMod

} from 'super/i-block/modules/decorators';

export type ComponentStatuses = Partial<Record<keyof typeof statuses, boolean>>;

export const
	$$ = symbolGenerator(),
	modsCache = Object.createDict<ModsNTable>(),
	literalCache = Object.createDict();

const classesCache = new Cache<'base' | 'blocks' | 'els', ReadonlyArray<string> | Readonly<Dictionary<string>>>([
	'base',
	'blocks',
	'els'
]);

@component()
export default class iBlock extends ComponentInterface<iBlock, iStaticPage> {
	/**
	 * Returns a link for the specified icon
	 * @param iconId
	 */
	static getIconLink(iconId: string): string {
		if (!(iconId in iconsMap)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		const q = location.search || (location.href.slice(-1) === '?' ? '?' : '');
		return `${location.pathname + q}#${icons(iconsMap[iconId]).id}`;
	}

	/**
	 * Component unique id
	 */
	@system({
		atom: true,
		unique: (ctx, oldCtx) => !ctx.$el.classList.contains(oldCtx.componentId),
		init: () => `uid-${Math.random().toString().slice(2)}`
	})

	readonly componentId!: string;

	/**
	 * If true, then if the component is functional it won't be destroyed after removal from DOM
	 */
	@prop(Boolean)
	readonly keepAlive: boolean = false;

	/**
	 * If true, then will be forcing activation hooks for all components instead of non functional components
	 */
	@prop(Boolean)
	readonly forceActivation: boolean = false;

	/**
	 * If true, then will be forcing initial activation hooks
	 * (only for functional components)
	 */
	@prop(Boolean)
	readonly forceInitialActivation: boolean = false;

	/**
	 * Link to i18n function
	 */
	@prop(Function)
	readonly i18n: typeof i18n = defaultI18n;

	/**
	 * Component unique name
	 */
	@prop({type: String, required: false})
	readonly globalName?: string;

	/**
	 * If true, then the component state will be synchronized with the router after initializing
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

	/**
	 * Link to the remote state object
	 */
	get remoteState(): Dictionary {
		return this.$root.remoteState;
	}

	/**
	 * Component initialize status
	 */
	@p({cache: false})
	get componentStatus(): Statuses {
		return this.shadowComponentStatusStore || <NonNullable<Statuses>>this.getField('componentStatusStore');
	}

	/**
	 * Sets a new component initialize status
	 * @param value
	 */
	set componentStatus(value: Statuses) {
		const
			old = this.componentStatus;

		if (old === value && value !== 'beforeReady') {
			return;
		}

		if ((<typeof iBlock>this.instance.constructor).shadowComponentStatuses[value]) {
			this.shadowComponentStatusStore = value;

		} else {
			this.shadowComponentStatusStore = undefined;
			this.setField('componentStatusStore', value);
		}

		this.setMod('status', value);
		this.localEvent.emit(`component.status.${value}`, value);
		this.emit(`status-${value}`, value);
	}

	/**
	 * Initial component modifiers
	 */
	@prop(Object)
	readonly modsProp: ModsTable = {};

	/**
	 * Initial component stage
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

	/**
	 * Component render weight
	 */
	@prop({type: Number, required: false})
	readonly weight?: number;

	/**
	 * Component stage store
	 */
	@p({cache: false})
	get stage(): CanUndef<Stage> {
		return this.getField('stageStore');
	}

	/**
	 * Sets a new component stage
	 * @emits stageChange(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)
	 */
	set stage(value: CanUndef<Stage>) {
		const
			oldValue = this.stage;

		if (oldValue === value) {
			return;
		}

		this.setField('stageStore', value);
		this.emit('stageChange', value, oldValue);
	}

	/**
	 * Group name for the current stage
	 */
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * Dispatching mode
	 */
	@prop(Boolean)
	readonly dispatching: boolean = false;

	/**
	 * If true, then all dispatching events will be emits as self component events
	 */
	@prop(Boolean)
	readonly selfDispatching: boolean = false;

	/**
	 * If true, then the component marked as a remote provider
	 */
	@prop(Boolean)
	readonly remoteProvider: boolean = false;

	/**
	 * Remote watchers table
	 */
	@prop(Object)
	readonly watchProp: Dictionary<MethodWatchers> = {};

	/**
	 * If true, then the current component is activated
	 */
	@prop(Boolean)
	readonly activatedProp: boolean = true;

	/**
	 * True if the current component is activated
	 */
	@system((o) => {
		o.execCbAtTheRightTime(() => {
			if (o.isFunctional && !o.getField('forceSelfActivation')) {
				return;
			}

			if (o.getField('isActivated')) {
				o.activate(true);

			} else {
				o.deactivate();
			}
		});

		return o.link('activatedProp', (val) => {
			if (o.hook !== 'beforeDataCreate') {
				o[val ? 'activate' : 'deactivate']();
			}

			return val;
		});
	})

	isActivated!: boolean;

	/**
	 * If true, then the component will be reinitialized after an activated hook
	 */
	@prop(Boolean)
	readonly needReInit: boolean = false;

	/**
	 * Additional classes for component elements
	 */
	@prop(Object)
	readonly classes: Classes = {};

	/**
	 * Advanced component parameters
	 */
	@prop(Object)
	readonly pProp: Dictionary = {};

	/**
	 * Returns the internal advanced parameters store value
	 */
	get p(): Dictionary {
		return <NonNullable<Dictionary>>this.getField('pStore');
	}

	/**
	 * Sets the internal advanced parameters store value
	 */
	set p(value: Dictionary) {
		this.setField('pStore', value);
	}

	/**
	 * Link to $root
	 */
	get r(): iStaticPage | any {
		return this.$root;
	}

	/**
	 * Link to the root router
	 */
	@p({cache: false})
	get router(): CanUndef<bRouter | any> {
		return this.getField('routerStore', this.$root);
	}

	/**
	 * Link to the root route object
	 */
	@p({cache: false})
	get route(): CanUndef<CurrentPage | any> {
		return this.getField('route', this.$root);
	}

	/**
	 * True if the current component is ready (componentStatus == ready)
	 */
	get isReady(): boolean {
		return this.componentStatus === 'ready';
	}

	/**
	 * True if the current component is functional
	 */
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * Base component modifiers
	 */
	get baseMods(): Readonly<ModsNTable> {
		const
			m = this.mods;

		return Object.freeze({
			theme: m.theme,
			size: m.size
		});
	}

	/**
	 * Component modifiers
	 */
	@system({
		merge: (ctx, oldCtx, key, link) => {
			if (!link) {
				return;
			}

			const
				cache = ctx.syncLinkCache[link];

			if (!cache) {
				return;
			}

			const
				l = cache[key];

			if (!l) {
				return;
			}

			const
				modsProp = ctx.$props[link],
				mods = {...oldCtx.mods};

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				if (ctx.syncModCache[key]) {
					delete mods[key];
				}
			}

			if (Object.fastCompare(modsProp, oldCtx.$props[link])) {
				l.sync(mods);

			} else {
				// tslint:disable-next-line:prefer-object-spread
				l.sync(Object.assign(mods, modsProp));
			}
		},

		init: (o) => {
			const
				declMods = o.meta.component.mods,
				attrMods = <string[][]>[],
				modVal = (val) => val != null ? String(val) : val;

			for (let attrs = o.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				if (key in declMods) {
					const
						v = attrs[key];

					o.watch(`$attrs.${key}`, (val) => o.setMod(key, modVal(val)));
					delete attrs[key];

					if (v == null) {
						continue;
					}

					attrMods.push([key, v]);
				}
			}

			return o.link((val) => {
				const
					declMods = o.meta.component.mods,
					// tslint:disable-next-line:prefer-object-spread
					mods = Object.assign(o.mods || {...declMods}, val);

				for (let i = 0; i < attrMods.length; i++) {
					const [key, val] = attrMods[i];
					mods[key] = val;
				}

				for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						val = modVal(mods[key]);

					mods[key] = val;
					o.hook !== 'beforeDataCreate' && o.setMod(key, val);
				}

				return mods;
			});
		}
	})

	readonly mods!: ModsNTable;

	/**
	 * Parent link
	 */
	static readonly PARENT: object = PARENT;

	/**
	 * Component shadow statuses
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
		beforeReady: true,
		inactive: true,
		destroyed: true,
		unloaded: true
	};

	/**
	 * Component modifiers
	 */
	static readonly mods: ModsDecl = {
		theme: [
			['default']
		],

		status: [
			['unloaded'],
			'loading',
			'beforeReady',
			'ready',
			'inactive',
			'destroyed'
		],

		size: [
			'xxs',
			'xs',
			's',
			['m'],
			'xs',
			'xxs'
		],

		progress: [
			'true',
			['false']
		],

		disabled: [
			'true',
			['false']
		],

		focused: [
			'true',
			['false']
		],

		hidden: [
			'true',
			['false']
		],

		width: [
			['normal'],
			'full',
			'auto'
		]
	};

	/**
	 * Size converter
	 */
	static sizeTo: SizeTo = {
		gt: {
			xxl: 'xxl',
			xl: 'xxl',
			l: 'xl',
			m: 'l',
			undefined: 'l',
			s: 'm',
			xs: 's',
			xxs: 'xs'
		},

		lt: {
			xxl: 'xl',
			xl: 'l',
			l: 'm',
			m: 's',
			undefined: 's',
			s: 'xs',
			xs: 'xxs',
			xxs: 'xxs'
		}
	};

	/**
	 * Component daemons
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * Wrapper for $refs
	 */
	@p({cache: false})
	protected get refs(): Dictionary<ComponentElement<iBlock> | Element> {
		const
			obj = this.$refs,
			res = {};

		if (obj) {
			for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = obj[key];

				if (!el) {
					continue;
				}

				res[key] = (<ComponentElement>el).component || <Element>el;
			}
		}

		return res;
	}

	/**
	 * Alias for iBlock.sizeTo.gt
	 */
	protected get gt(): Dictionary<string> {
		return (<typeof iBlock>this.instance.constructor).sizeTo.gt;
	}

	/**
	 * Alias for iBlock.sizeTo.lt
	 */
	protected get lt(): Dictionary<string> {
		return (<typeof iBlock>this.instance.constructor).sizeTo.lt;
	}

	/**
	 * Link to bIcon.getIconLink
	 */
	protected get getIconLink(): typeof iBlock.getIconLink {
		return (<typeof iBlock>this.instance.constructor).getIconLink;
	}

	/**
	 * Render counter (for forceUpdate)
	 */
	@field()
	protected renderCounter: number = 0;

	/**
	 * Advanced component parameters internal storage
	 */
	@field((o) => o.link())
	protected pStore: Dictionary = {};

	/**
	 * Component stage store
	 */
	@field((o) => o.link((val, old) => {
		if (val === old) {
			return;
		}

		o.emit('stageChange', val, old);
		return val;
	}))

	protected stageStore?: Stage;

	/**
	 * Number of beforeReady event listeners
	 * @type {number}
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * Component initialize status store
	 */
	@system({unique: true})
	protected componentStatusStore: Statuses = 'unloaded';

	/**
	 * Component initialize status store for non watch statuses
	 */
	@system()
	protected shadowComponentStatusStore?: Statuses;

	/**
	 * Watched store of component modifiers
	 */
	@field({merge: true})
	protected watchModsStore: ModsNTable = {};

	/**
	 * Watched component modifiers
	 */
	protected get m(): Readonly<ModsNTable> {
		const
			o = {},
			w = <NonNullable<ModsNTable>>this.getField('watchModsStore'),
			m = this.mods;

		for (let keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = m[key];

			if (key in w) {
				o[key] = val;

			} else {
				Object.defineProperty(o, key, {
					get: () => {
						if (!(key in w)) {
							w[key] = val;
						}

						return val;
					}
				});
			}
		}

		return Object.freeze(o);
	}

	/**
	 * Cache of ifOnce
	 */
	@field({merge: true})
	protected readonly ifOnceStore: Dictionary = {};

	/**
	 * Temporary cache
	 */
	@system({merge: true})
	protected tmp: Dictionary = {};

	/**
	 * Temporary cache with watching
	 */
	@field({merge: true})
	protected watchTmp: Dictionary = {};

	/**
	 * Cache for prop/field links
	 */
	@system({unique: true})
	protected readonly linksCache!: Dictionary<Dictionary>;

	/**
	 * Cache for prop/field synchronize functions
	 */
	@system({unique: true})
	protected readonly syncLinkCache!: SyncLinkCache;

	/**
	 * Cache for modifiers synchronize functions
	 */
	@system({unique: true})
	protected readonly syncModCache!: Dictionary<Function>;

	/**
	 * Link to the current component
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => ctx
	})

	protected readonly self!: this;

	/**
	 * API for async operations
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Async(ctx)
	})

	protected readonly async!: Async<this>;

	/**
	 * API for BEM like develop
	 */
	@system({unique: true})
	protected block!: Block;

	/**
	 * Daemons API
	 */
	@system({
		unique: true,
		init: (ctx) => new Daemons(ctx)
	})

	protected daemons!: Daemons;

	/**
	 * Local event emitter
	 */
	@system({
		atom: true,
		unique: true,
		init: () => new EventEmitter({maxListeners: 100, wildcard: true})
	})

	protected readonly localEvent!: EventEmitter;

	/**
	 * Global event emitter
	 */
	protected get globalEvent(): Event<this> {
		const
			{async: $a} = this;

		return {
			emit: (event, ...args) => globalEvent.emit(event, ...args),
			on: (event, fn, params, ...args) => $a.on(globalEvent, event, fn, params, ...args),
			once: (event, fn, params, ...args) => $a.once(globalEvent, event, fn, params, ...args),
			promisifyOnce: (event, params, ...args) => $a.promisifyOnce(globalEvent, event, params, ...args),
			off: (...args) => $a.off(...args)
		};
	}

	/**
	 * Root event emitter
	 */
	protected get rootEvent(): RemoteEvent<this> {
		const
			{async: $a, $root: $e} = this;

		return {
			on: (event, fn, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.on($e, event, fn, params, ...args);
			},

			once: (event, fn, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.once($e, event, fn, params, ...args);
			},

			promisifyOnce: (event, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.promisifyOnce($e, event, params, ...args);
			},

			off: (...args) => {
				if (!$e) {
					return;
				}

				$a.off(...args);
			}
		};
	}

	/**
	 * Parent event emitter
	 */
	protected get parentEvent(): RemoteEvent<this> {
		const
			{async: $a, $parent: $e} = this;

		return {
			on: (event, fn, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.on($e, event, fn, params, ...args);
			},

			once: (event, fn, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.once($e, event, fn, params, ...args);
			},

			promisifyOnce: (event, params, ...args) => {
				if (!$e) {
					return;
				}

				return $a.promisifyOnce($e, event, params, ...args);
			},

			off: (...args) => {
				if (!$e) {
					return;
				}

				$a.off(...args);
			}
		};
	}

	/**
	 * Storage object
	 */
	@system({
		atom: true,
		unique: true,
		init: (o) => asyncLocal.namespace(o.componentName)
	})

	protected readonly storage!: AsyncNamespace;

	/**
	 * Cache of child async components
	 */
	@field({unique: true})
	protected readonly asyncComponents: Dictionary<string> = {};

	/**
	 * Cache of child background async components
	 */
	@field({unique: true})
	protected readonly asyncBackComponents: Dictionary<string> = {};

	/**
	 * Some helpers
	 */
	@system({
		atom: true,
		unique: true,
		init: () => helpers
	})

	protected readonly h!: typeof helpers;

	/**
	 * Browser constants
	 */
	@system({
		atom: true,
		unique: true,
		init: () => browser
	})

	protected readonly b!: typeof browser;

	/**
	 * Alias for .i18n
	 */
	@system({
		atom: true,
		init: (o) => o.link('i18n')
	})

	protected readonly t!: typeof i18n;

	/**
	 * Link to window.l
	 */
	@system({
		atom: true,
		unique: true,
		init: () => l
	})

	protected readonly l!: typeof l;

	/**
	 * Link to console API
	 */
	@system({
		atom: true,
		unique: true,
		init: () => console
	})

	protected readonly console!: Console;

	/**
	 * Link to window.location
	 */
	@system({
		atom: true,
		unique: true,
		init: () => location
	})

	protected readonly location!: Location;

	/**
	 * Link to the global object
	 */
	@system({
		atom: true,
		unique: true,
		init: () => window
	})

	protected readonly global!: Window;

	/**
	 * Returns a string id, which is connected to the component
	 * @param id - custom id
	 */
	getConnectedId(id: string): string;
	getConnectedId(id: undefined | null): undefined;
	getConnectedId(id: Nullable<string>): CanUndef<string> {
		if (!id) {
			return undefined;
		}

		return `${this.componentId}-${id}`;
	}

	/**
	 * Wrapper for $watch
	 *
	 * @see Async.worker
	 * @param exprOrFn
	 * @param cb
	 * @param [params] - additional parameters
	 */
	watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		cb: (this: this, n: T, o?: T) => void,
		params?: AsyncWatchOpts
	): void {
		this.execCbAfterCreated(() => {
			const
				p = params || {};

			const watchParams = {
				handler: cb,
				deep: p.deep,
				immediate: p.immediate
			};

			const
				watcher = this.$watch(exprOrFn, watchParams);

			if (p.group || p.label || p.join) {
				this.async.worker(watcher, {group: p.group, label: p.label, join: p.join});
				return;
			}
		});
	}

	/**
	 * Sets a link for the specified field
	 *
	 * @see Async.worker
	 * @param [paramsOrWrapper] - additional parameters or wrapper
	 */
	link<T = unknown>(paramsOrWrapper?: AsyncWatchOpts | LinkWrapper<T>): CanUndef<T>;

	/**
	 * @see Async.worker
	 * @param params - additional parameters
	 * @param [wrapper]
	 */
	link<T = unknown>(params: AsyncWatchOpts, wrapper?: LinkWrapper<T>): CanUndef<T>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param [paramsOrWrapper]
	 */
	link<T = unknown>(field: string, paramsOrWrapper?: AsyncWatchOpts | LinkWrapper<T>): CanUndef<T>;

	/**
	 * @see Async.worker
	 * @param field
	 * @param params
	 * @param [wrapper]
	 */
	link<T = unknown>(field: string, params: AsyncWatchOpts, wrapper?: LinkWrapper<T>): CanUndef<T>;
	link<T>(
		field?: string | AsyncWatchOpts | LinkWrapper<T>,
		params?: AsyncWatchOpts | LinkWrapper<T>,
		wrapper?: LinkWrapper<T>
	): CanUndef<T> {
		const
			path = this.$activeField,
			cache = this.syncLinkCache;

		if (!field || !Object.isString(field)) {
			wrapper = <LinkWrapper<T>>params;
			params = <AsyncWatchOpts>field;
			field = `${path.replace(/Store$/, '')}Prop`;
		}

		if (params && Object.isFunction(params)) {
			wrapper = params;
			params = undefined;
		}

		if (!(path in this.linksCache)) {
			this.linksCache[path] = {};

			this.watch(field, async (val, oldVal) => {
				if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.getField(path))) {
					return;
				}

				this.setField(path, wrapper ? wrapper.call(this, val, oldVal) : val);
			}, params);

			const sync = (val?) => {
				val = val || this.getField(<string>field);

				const
					res = wrapper ? wrapper.call(this, val) : val;

				this.setField(path, res);
				return res;
			};

			// tslint:disable-next-line:prefer-object-spread
			cache[field] = Object.assign(cache[field] || {}, {
				[path]: {
					path,
					sync
				}
			});

			if (this.isBeforeCreate('beforeDataCreate')) {
				const
					name = '[[SYNC]]',
					hooks = this.meta.hooks.beforeDataCreate;

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
	createWatchObject<T = unknown>(
		path: string,
		fields: WatchObjectFields<T>
	): Dictionary;

	/**
	 * @param path - property path
	 * @param params - additional parameters
	 * @param fields
	 */
	createWatchObject<T = unknown>(
		path: string,
		params: AsyncWatchOpts,
		fields: WatchObjectFields<T>
	): Dictionary;

	createWatchObject<T>(
		path: string,
		params: AsyncWatchOpts | WatchObjectFields<T>,
		fields?: WatchObjectFields<T>
	): Dictionary {
		if (Object.isArray(params)) {
			fields = <WatchObjectFields<T>>params;
			params = {};
		}

		const
			hooks = this.meta.hooks.beforeDataCreate,
			syncLinkCache = this.syncLinkCache,
			linksCache = $C(this.linksCache);

		const
			head = this.$activeField;

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
			$C(obj).set({}, tail);
		}

		const
			cursor = $C(obj).get(tail);

		const merge = (...args) => Object.mixin({
			deep: true,
			extendFilter: (d, v) => Object.isObject(v)
		}, undefined, ...args);

		const setField = (path, val) => {
			const
				newObj = {};

			$C(newObj).set(val, path.split('.').slice(1));
			this.setField(head, merge(this.getField(head), newObj));

			return val;
		};

		const attachWatcher = (field, path, getVal) => {
			linksCache.set(true, path);

			this.watch(field, (val, oldVal) => {
				if (Object.fastCompare(val, oldVal) || Object.fastCompare(val, this.getField(path))) {
					return;
				}

				setField(path, val);
			}, <AsyncWatchOpts>params);

			const
				sync = (val?) => setField(path, getVal(val));

			// tslint:disable-next-line:prefer-object-spread
			syncLinkCache[field] = Object.assign(syncLinkCache[field] || {}, {
				[path]: {
					path,
					sync
				}
			});

			if (this.isBeforeCreate('beforeDataCreate')) {
				hooks.push({fn: sync});
			}
		};

		for (let i = 0; i < (<unknown[]>fields).length; i++) {
			const
				el = (<WatchObjectFields<T>>fields)[i];

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

				if (!linksCache.get(l)) {
					const getVal = (val?) => {
						val = val || this.getField(field);
						return wrapper ? wrapper.call(this, val) : val;
					};

					attachWatcher(field, l, getVal);
					cursor[el[0]] = getVal();
				}

			} else {
				const
					l = [path, el].join('.');

				if (!linksCache.get(l)) {
					const getVal = (val?) => val || this.getField(el);
					attachWatcher(el, l, getVal);
					cursor[el] = getVal();
				}
			}
		}

		return obj;
	}

	/**
	 * Binds a modifier to the specified field
	 *
	 * @param mod
	 * @param field
	 * @param [converter] - converter function or additional parameters
	 * @param [params] - additional parameters
	 */
	bindModTo<V = unknown, R = unknown, CTX extends iBlock = this>(
		mod: string,
		field: string,
		converter: BindModCb<V, R, CTX> | AsyncWatchOpts = Boolean,
		params?: AsyncWatchOpts
	): void {
		mod = mod.camelize(false);

		if (!Object.isFunction(converter)) {
			params = converter;
			converter = Boolean;
		}

		const
			fn = <Function>converter;

		const setWatcher = () => {
			this.watch(field, (val) => {
				this.setMod(mod, fn(val, this));
			}, params);
		};

		if (this.isBeforeCreate()) {
			const sync = this.syncModCache[mod] = () => {
				this.mods[mod] = String(fn(this.getField(field), this));
			};

			if (this.hook !== 'beforeDataCreate') {
				this.meta.hooks.beforeDataCreate.push({
					fn: sync
				});

			} else {
				sync();
			}

			setWatcher();

		} else if (statuses[this.componentStatus] >= 1) {
			setWatcher();
		}
	}

	/**
	 * Wrapper for $emit
	 *
	 * @param event
	 * @param args
	 */
	emit(event: string, ...args: unknown[]): void {
		event = event.dasherize();
		this.$emit(event, this, ...args);
		this.$emit(`on-${event}`, ...args);
		this.dispatching && this.dispatch(event, ...args);
		this.log(`event:${event}`, this, ...args);
	}

	/**
	 * Emits the specified event for the parent component
	 *
	 * @param event
	 * @param args
	 */
	dispatch(event: string, ...args: unknown[]): void {
		event = event.dasherize();

		let
			obj = this.$parent;

		while (obj) {
			if (obj.selfDispatching) {
				obj.$emit(event, this, ...args);

			} else {
				obj.$emit(`${this.componentName}::${event}`, this, ...args);

				if (this.globalName) {
					obj.$emit(`${this.globalName.dasherize()}::${event}`, this, ...args);
				}
			}

			if (!obj.dispatching) {
				break;
			}

			obj = obj.$parent;
		}
	}

	/**
	 * Wrapper for $on
	 *
	 * @see Async.on
	 * @param event
	 * @param cb
	 * @param [params] - async parameters
	 */
	on<E = unknown, R = unknown>(event: string, cb: ProxyCb<E, R, this>, params?: AsyncOpts): void {
		event = event.dasherize();

		if (params) {
			this.async.on(this, event, cb, params);
			return;
		}

		this.$on(event, cb);
	}

	/**
	 * Wrapper for $once
	 *
	 * @see Async.on
	 * @param event
	 * @param cb
	 * @param [params] - async parameters
	 */
	once<E = unknown, R = unknown>(event: string, cb: ProxyCb<E, R, this>, params?: AsyncOpts): void {
		event = event.dasherize();

		if (params) {
			this.async.once(this, event, cb, params);
			return;
		}

		this.$once(event, cb);
	}

	/**
	 * Wrapper for promisify $once
	 *
	 * @see Async.on
	 * @param event
	 * @param [params] - async parameters
	 */
	promisifyOnce<T = unknown>(event: string, params?: AsyncOpts): Promise<T> {
		event = event.dasherize();
		return this.async.promisifyOnce(this, event, params);
	}

	/**
	 * Wrapper for $off
	 *
	 * @param [event]
	 * @param [cb]
	 */
	off(event?: string, cb?: Function): void;

	/**
	 * @see Async.off
	 * @param [params] - async parameters
	 */
	off(params: ClearOptsId<object>): void;
	off(eventOrParams?: string | ClearOptsId<object>, cb?: Function): void {
		if (!eventOrParams || Object.isString(eventOrParams)) {
			const
				e = eventOrParams;

			this.$off(e && e.dasherize(), cb);
			return;
		}

		this.async.off(eventOrParams);
	}

	/**
	 * Wrapper for a wait decorator
	 *
	 * @see Async.promise
	 * @param status
	 * @param [params] - additional parameters:
	 *   *) [params.defer] - if true, then the function will always return a promise
	 */
	waitStatus(status: Statuses, params?: WaitStatusOpts): Promise<void>;

	/**
	 * @see Async.promise
	 * @param status
	 * @param cb
	 * @param [params] - additional parameters:
	 *   *) [params.defer] - if true, then the function will always return a promise
	 */
	waitStatus<T = unknown>(status: Statuses, cb: (this: this) => T, params?: WaitStatusOpts): CanPromise<T>;
	waitStatus<T = unknown>(
		status: Statuses,
		cbOrParams?: Function | WaitStatusOpts,
		params?: WaitStatusOpts
	): CanPromise<T> {
		const
			isFn = cbOrParams && Object.isFunction(cbOrParams),
			p = {...(isFn ? params : cbOrParams) || {}, join: false};

		if (isFn) {
			return wait(status, {fn: <Function>cbOrParams, ...p}).call(this);
		}

		return this.async.promise(new Promise((r) => wait(status, {fn: r, ...p}).call(this)));
	}

	/**
	 * Wrapper for $nextTick
	 *
	 * @see Async.proxy
	 * @param cb
	 * @param [params] - async parameters
	 */
	nextTick(cb: WrappedFunction, params?: AsyncOpts): void;

	/**
	 * @see Async.promise
	 * @param [params] - async parameters
	 */
	nextTick(params?: AsyncOpts): Promise<void>;
	nextTick(cbOrParams?: WrappedFunction | AsyncOpts, params?: AsyncOpts): CanPromise<void> {
		const
			{async: $a} = this;

		if (cbOrParams && Object.isFunction(cbOrParams)) {
			this.$nextTick($a.proxy(cbOrParams, params));
			return;
		}

		return $a.promise(this.$nextTick(), cbOrParams);
	}

	/**
	 * Wrapper for $forceUpdate
	 */
	@wait({defer: true, label: $$.forceUpdate})
	async forceUpdate(): Promise<void> {
		this.renderCounter++;
	}

	/**
	 * Loads component data
	 *
	 * @param [data] - data object (for events)
	 * @param [silent] - silent mode
	 *
	 * @emits initLoad(data: CanUndef<unknown>, silent: boolean)
	 * @emits dbReady(data: CanUndef<unknown>, silent: boolean)
	 */
	@hook('beforeDataCreate')
	initLoad(data?: unknown | ((this: this) => unknown), silent?: boolean): CanPromise<void> {
		this.beforeReadyListeners = 0;

		if (!silent) {
			this.componentStatus = 'loading';
		}

		const
			{$children: $c, async: $a} = this,
			providers = new Set();

		if ($c) {
			for (let i = 0; i < $c.length; i++) {
				const
					el = $c[i];

				if (el.remoteProvider && statuses[el.componentStatus] >= 1) {
					providers.add(el);
				}
			}
		}

		const done = () => {
			const
				get = () => Object.isFunction(data) ? data.call(this) : data;

			this.execCbAtTheRightTime(() => this.emit('dbReady', get(), silent));
			this.componentStatus = 'beforeReady';

			this.execCbAfterBlockReady(async () => {
				if (this.beforeReadyListeners > 1) {
					await this.nextTick();
					this.beforeReadyListeners = 0;
				}

				this.componentStatus = 'ready';
				this.emit('initLoad', get(), silent);
			});
		};

		if (this.globalName || providers.size) {
			const init = async () => {
				await this.initStateFromStorage();

				if (providers.size) {
					await $a.wait(() => $C(providers).every((el) => {
						const
							st = <string>el.componentStatus;

						if (st === 'ready' || statuses[st] <= 0) {
							providers.delete(el);
							return true;
						}

						return false;
					}));
				}

				done();
			};

			return $a.promise(init, {join: true, label: $$.initLoad}).catch(stderr);
		}

		done();
	}

	/**
	 * Reloads component data
	 */
	async reload(): Promise<void> {
		await this.initLoad(undefined, true);
	}

	/**
	 * Returns an array of component classes by the specified parameters
	 *
	 * @param [componentName] - name of the source component
	 * @param mods - map of modifiers
	 */
	getBlockClasses(componentName: CanUndef<string>, mods: ModsTable): ReadonlyArray<string>;

	/**
	 * @param mods - map of modifiers
	 */
	getBlockClasses(mods: ModsTable): ReadonlyArray<string>;
	getBlockClasses(componentName?: string | ModsTable, mods?: ModsTable): ReadonlyArray<string> {
		if (arguments.length === 1) {
			mods = <ModsTable>componentName;
			componentName = undefined;

		} else {
			mods = <ModsTable>mods;
			componentName = <CanUndef<string>>componentName;
		}

		const
			key = JSON.stringify(mods) + componentName,
			cache = classesCache.create('blocks', this.componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = [this.getFullBlockName(componentName)];

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(this.getFullBlockName(componentName, key, val));
			}
		}

		return classes;
	}

	/**
	 * Sets a component modifier
	 *
	 * @param node
	 * @param name
	 * @param value
	 */
	setMod(node: Element, name: string, value: unknown): CanPromise<boolean>;

	/**
	 * @param name
	 * @param value
	 */
	setMod(name: string, value: unknown): CanPromise<boolean>;
	setMod(nodeOrName: Element | string, name: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
			return this.execCbAfterBlockReady(() => this.block.setMod(nodeOrName, name));
		}

		return Block.prototype.setMod.call(
			this.createBlockCtxFromNode(nodeOrName),
			name,
			value
		);
	}

	/**
	 * Removes a component modifier
	 *
	 * @param node
	 * @param name
	 * @param [value]
	 */
	removeMod(node: Element, name: string, value?: unknown): CanPromise<boolean>;

	/**
	 * @param name
	 * @param [value]
	 */
	removeMod(name: string, value?: unknown): CanPromise<boolean>;
	removeMod(nodeOrName: Element | string, name?: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
			return this.execCbAfterBlockReady(() => this.block.removeMod(nodeOrName, name));
		}

		return Block.prototype.removeMod.call(
			this.createBlockCtxFromNode(nodeOrName),
			name,
			value
		);
	}

	/**
	 * Sets a modifier for the root element
	 *
	 * @param name
	 * @param value
	 */
	setRootMod(name: string, value: unknown): boolean {
		return this.$root.setRootMod(name, value, this);
	}

	/**
	 * Removes a modifier from the root element
	 *
	 * @param name
	 * @param value
	 */
	removeRootMod(name: string, value?: unknown): boolean {
		return this.$root.removeRootMod(name, value, this);
	}

	/**
	 * Returns a value of the specified root element modifier
	 * @param name
	 */
	getRootMod(name: string): CanUndef<string> {
		return this.$root.getRootMod(name, this);
	}

	/**
	 * Activates the component
	 * @param [force]
	 */
	activate(force?: boolean): void {
		if (!this.isActivated || force) {
			this.initStateFromRouter();
			this.execCbAfterCreated(() => this.rootEvent.on('onTransition', async (route, type) => {
				if (type === 'hard' && route !== this.r.route) {
					await this.rootEvent.promisifyOnce('setRoute', {
						label: $$.activateAfterTransition
					});
				}

				this.initStateFromRouter();

			}, {
				label: $$.activate,
				group: 'routerStateWatchers'
			}));
		}

		if (this.isBeforeCreate()) {
			return;
		}

		const
			els = new Set();

		const exec = (ctx: iBlock = this) => {
			els.add(ctx);

			const
				children = ctx.$children;

			if (children) {
				for (let i = 0; i < children.length; i++) {
					exec(children[i]);
				}
			}
		};

		exec();

		const
			{$el} = this;

		if (this.forceActivation && $el) {
			const
				domEls = $el.querySelectorAll('.i-block-helper');

			for (let i = 0; i < domEls.length; i++) {
				const
					el = (<ComponentElement<any>>domEls[i]).component;

				if (el) {
					els.add(el);
				}
			}
		}

		for (let w = els.values(), el = w.next(); !el.done; el = w.next()) {
			const
				ctx = el.value;

			if (!ctx.isActivated) {
				runHook('activated', ctx.meta, ctx).then(() => ctx.activated(), stderr);
			}
		}
	}

	/**
	 * Deactivates the component
	 */
	deactivate(): void {
		if (this.isBeforeCreate()) {
			return;
		}

		const
			els = new Set();

		const exec = (ctx: iBlock = this) => {
			els.add(ctx);

			const
				children = ctx.$children;

			if (children) {
				for (let i = 0; i < children.length; i++) {
					exec(children[i]);
				}
			}
		};

		exec();

		const
			{$el} = this;

		if (this.forceActivation && $el) {
			const
				domEls = $el.querySelectorAll('.i-block-helper');

			for (let i = 0; i < domEls.length; i++) {
				const
					el = (<ComponentElement<any>>domEls[i]).component;

				if (el) {
					els.add(el);
				}
			}
		}

		for (let w = els.values(), el = w.next(); !el.done; el = w.next()) {
			const
				ctx = el.value;

			if (ctx.isActivated) {
				runHook('deactivated', ctx.meta, ctx).then(() => ctx.deactivated(), stderr);
			}
		}
	}

	/**
	 * Disables the component
	 */
	async disable(): Promise<boolean> {
		return this.setMod('disabled', true);
	}

	/**
	 * Enables the component
	 */
	async enable(): Promise<boolean> {
		return this.setMod('disabled', false);
	}

	/**
	 * Sets focus for the component
	 */
	async focus(): Promise<boolean> {
		return this.setMod('focused', true);
	}

	/**
	 * Unsets focus for the component
	 */
	async blur(): Promise<boolean> {
		return this.setMod('focused', false);
	}

	/**
	 * Returns true if the component has all modifiers from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifEveryMods(mods: Array<CanArray<string>>, value?: ModVal): boolean {
		return $C(mods).every((el) => {
			if (Object.isArray(el)) {
				return this.mods[<string>el[0]] === String(el[1]);
			}

			return this.mods[el] === String(value);
		});
	}

	/**
	 * Returns true if the component has at least one modifier from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifSomeMod(mods: Array<CanArray<string>>, value?: ModVal): boolean {
		return $C(mods).some((el) => {
			if (Object.isArray(el)) {
				return this.mods[<string>el[0]] === String(el[1]);
			}

			return this.mods[el] === String(value);
		});
	}

	/**
	 * Sets a new property to the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value
	 * @param [obj]
	 */
	setField<T = unknown>(path: string, value: T, obj: Dictionary = this): T {
		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.isBeforeCreate();

		let
			ref = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				const
					val = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (isField && isReady) {
					ctx.$set(ref, prop, val);

				} else {
					ref[prop] = val;
				}
			}

			ref = <Dictionary>ref[prop];
		}

		if (path in ref) {
			ref[path] = value;

		} else {
			if (isField && isReady) {
				ctx.$set(ref, path, value);

			} else {
				ref[path] = value;
			}
		}

		return value;
	}

	/**
	 * Deletes a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	deleteField(path: string, obj: Dictionary = this): boolean {
		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]],
			isReady = !ctx.isBeforeCreate();

		let
			test = true,
			ref = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				test = false;
				break;
			}

			ref = <Dictionary>ref[prop];
		}

		if (test) {
			if (isField && isReady) {
				ctx.$delete(ref, path);

			} else {
				delete ref[path];
			}

			return true;
		}

		return false;
	}

	/**
	 * Returns a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	getField<T = unknown>(path: string, obj: Dictionary = this): CanUndef<T> {
		let
			// tslint:disable-next-line:no-this-assignment
			ctx: iBlock = this,
			isComponent = obj === this;

		if (obj.instance instanceof iBlock) {
			ctx = <iBlock>obj;
			isComponent = true;
		}

		const
			chunks = path.split('.'),
			isField = isComponent && ctx.meta.fields[chunks[0]];

		let
			res = isField ? ctx.$$data : obj;

		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			res = <Dictionary>res[chunks[i]];
		}

		return <any>res;
	}

	/**
	 * Gets values from the specified object and saves it to the component state
	 * @param [obj]
	 */
	setState(obj?: Dictionary): void {
		$C(obj).forEach((el, key) => {
			const
				p = key.split('.');

			if (p[0] === 'mods') {
				this.setMod(p[1], el);

			} else if (!Object.fastCompare(el, this.getField(key))) {
				this.setField(key, el);
			}
		});
	}

	/**
	 * Executes the specified callback after beforeDataCreate hook or beforeReady event
	 *
	 * @see Async.proxy
	 * @param cb
	 * @param [params] - async parameters
	 */
	execCbAtTheRightTime<T = unknown>(cb: (this: this) => T, params?: AsyncOpts): CanPromise<T | void> {
		if (this.isBeforeCreate('beforeDataCreate')) {
			return <any>this.$async.promise(new Promise((r) => {
				this.meta.hooks.beforeDataCreate.push({fn: () => r(cb.call(this))});
			}), params).catch(stderr);
		}

		if (this.hook === 'beforeDataCreate') {
			return cb.call(this);
		}

		this.beforeReadyListeners++;

		const
			res = this.waitStatus('beforeReady', cb, params);

		if (Object.isPromise(res)) {
			return res.catch(stderr);
		}

		return res;
	}

	/**
	 * Puts the specified parameters to log
	 *
	 * @param key - log key or log message options
	 * @param [details]
	 */
	protected log(key: string | LogMessageOptions, ...details: unknown[]): void {
		let type;

		if (!Object.isString(key)) {
			type = key.type;
			key = key.key;
		}

		log({key: ['component', key, this.componentName].join(':'), type}, ...details, this);

		if (this.globalName) {
			log({key: ['component:global', this.globalName, key, this.componentName].join(':'), type}, ...details, this);
		}
	}

	/**
	 * Creates a new function from the specified that executes deferredly
	 *
	 * @see Async.setTimeout
	 * @param fn
	 * @param [params] - async parameters
	 */
	protected createDeferFn(fn: Function, params?: AsyncOpts): Function {
		return (...args) => this.async.setTimeout(() => fn.call(this, ...args), 0.2.second(), params);
	}

	/**
	 * Accumulates a temporary object and apply it with the specified function
	 *
	 * @param obj
	 * @param key - cache key
	 * @param fn
	 */
	protected accumulateTmpObj(
		obj: Dictionary,
		key: string | symbol,
		fn: (this: this, obj: Dictionary) => void
	): void {
		const
			t = this.tmp,
			k = <string>key,
			tmp = t[k] = t[k] || {};

		Object.assign(
			tmp,
			obj
		);

		this.createDeferFn(() => {
			fn.call(this, tmp);
			t[k] = undefined;

		}, {
			label: $$.accumulateTmpObj
		})();
	}

	/**
	 * Creates a fake context for a Block instance from the specified node
	 * @param node
	 */
	protected createBlockCtxFromNode(node: Element): Dictionary {
		const
			$el = <ComponentElement<iBlock>>node,
			comp = $el.component;

		const
			rgxp = /(?:^| )([bpg]-[^_ ]+)(?: |$)/,
			componentName = comp ? comp.componentName : $C(rgxp.exec($el.className)).get('1') || this.componentName;

		return Object.assign(Object.create(Block.prototype), {
			component: {
				$el,
				componentName,
				localEvent: comp ? comp.localEvent : {emit(): void { /* loopback */ }},
				mods: comp ? comp.mods : undefined
			}
		});
	}

	/**
	 * Executes the specified render object
	 *
	 * @param renderObj
	 * @param [ctx] - render context
	 */
	protected execRenderObject(
		renderObj: RenderObject,
		ctx?: RenderContext | [Dictionary] | [Dictionary, RenderContext]
	): VNode {
		let
			instanceCtx,
			renderCtx;

		const
			i = this.instance;

		if (ctx && Object.isArray(ctx)) {
			instanceCtx = ctx[0] || this;
			renderCtx = ctx[1];

			if (instanceCtx !== this) {
				instanceCtx.getBlockClasses = i.getBlockClasses.bind(instanceCtx);
				instanceCtx.getFullBlockName = i.getFullBlockName.bind(instanceCtx);
				instanceCtx.getFullElName = i.getFullElName.bind(instanceCtx);
				instanceCtx.getElClasses = i.getElClasses.bind(instanceCtx);
				instanceCtx.execRenderObject = i.execRenderObject.bind(instanceCtx);
				instanceCtx.findElFromVNode = i.findElFromVNode.bind(instanceCtx);
			}

		} else {
			instanceCtx = this;
			renderCtx = ctx;
		}

		const
			vnode = execRenderObject(renderObj, instanceCtx);

		if (renderCtx) {
			return patchVNode(vnode, instanceCtx, renderCtx);
		}

		return vnode;
	}

	/**
	 * Returns a full name of the specified component
	 *
	 * @param [componentName]
	 * @param [modName]
	 * @param [modValue]
	 */
	protected getFullBlockName(componentName: string = this.componentName, modName?: string, modValue?: unknown): string {
		return Block.prototype.getFullBlockName.call({blockName: componentName}, modName, modValue);
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param componentName
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	protected getFullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string;

	/**
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	protected getFullElName(elName: string, modName?: string, modValue?: unknown): string;
	protected getFullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string {
		if (!{2: true, 4: true}[arguments.length]) {
			modValue = modName;
			modName = elName;
			elName = componentName;
			componentName = this.componentName;
		}

		return Block.prototype.getFullElName.call({blockName: componentName}, elName, modName, modValue);
	}

	/**
	 * Searches an element by the specified name from a virtual node
	 *
	 * @param vnode
	 * @param elName
	 * @param [ctx] - component context
	 */
	protected findElFromVNode(vnode: VNode, elName: string, ctx: iBlock = this): CanUndef<VNode> {
		const
			selector = ctx.getFullElName(elName);

		const search = (vnode) => {
			const
				data = vnode.data || {};

			const classes = Object.fromArray([].concat(
				(data.staticClass || '').split(' '),
				data.class || []
			));

			if (classes[selector]) {
				return vnode;
			}

			if (vnode.children) {
				for (let i = 0; i < vnode.children.length; i++) {
					const
						res = search(vnode.children[i]);

					if (res) {
						return res;
					}
				}
			}

			return undefined;
		};

		return search(vnode);
	}

	/**
	 * Sets g-hint for the specified element
	 * @param [pos] - hint position
	 */
	protected setHint(pos: string = 'bottom'): ReadonlyArray<string> {
		return this.getBlockClasses('g-hint', {pos});
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 *
	 * @param componentNameOrCtx
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	protected getElClasses(componentNameOrCtx: string | iBlock, els: Dictionary<ModsTable>): ReadonlyArray<string>;

	/**
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	protected getElClasses(els: Dictionary<ModsTable>): ReadonlyArray<string>;
	protected getElClasses(
		componentNameOrCtx: string | iBlock | Dictionary<ModsTable>,
		els?: Dictionary<ModsTable>
	): ReadonlyArray<string> {
		let
			id,
			componentName;

		if (arguments.length === 1) {
			id = this.componentId;
			componentName = this.componentName;
			els = <Dictionary<ModsTable>>componentNameOrCtx;

		} else {
			if (Object.isString(componentNameOrCtx)) {
				componentName = componentNameOrCtx;

			} else {
				id = (<iBlock>componentNameOrCtx).componentId;
				componentName = (<iBlock>componentNameOrCtx).componentName;
			}
		}

		if (!els) {
			return Object.freeze([]);
		}

		const
			key = JSON.stringify(els),
			cache = classesCache.create('els', id || componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = id ? [id] : [];

		for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(
				this.getFullElName(<string>componentName, el)
			);

			if (!Object.isObject(mods)) {
				continue;
			}

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				if (val !== undefined) {
					classes.push(this.getFullElName(<string>componentName, el, key, val));
				}
			}
		}

		return Object.freeze(classes);
	}

	/**
	 * Puts the component root element to the render stream
	 * @param cb
	 */
	@wait('ready')
	protected async putInStream(cb: (el: Element) => void): Promise<boolean> {
		const
			el = this.$el;

		if (el.clientHeight) {
			cb.call(this, el);
			return false;
		}

		const wrapper = document.createElement('div');
		Object.assign(wrapper.style, {
			'display': 'block',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'z-index': -1,
			'opacity': 0
		});

		const
			parent = el.parentNode,
			before = el.nextSibling;

		wrapper.appendChild(el);
		document.body.appendChild(wrapper);
		await cb.call(this, el);

		if (parent) {
			if (before) {
				parent.insertBefore(el, before);

			} else {
				parent.appendChild(el);
			}
		}

		wrapper.remove();
		return true;
	}

	/**
	 * Saves the specified settings to a local storage by a key
	 *
	 * @param settings
	 * @param [key] - data storage key
	 */
	protected async saveSettings<T extends object = Dictionary>(settings: T, key: string = ''): Promise<T> {
		const
			$a = this.async,
			id = `${this.globalName}_${key}`;

		return $a.promise(async () => {
			try {
				await this.storage.set(id, settings);
				this.log('settings:save', () => Object.fastClone(settings));

			} catch {}

			return settings;

		}, {
			label: id,
			group: 'saveSettings',
			join: 'replace'
		});
	}

	/**
	 * Loads settings from a local storage by the specified key
	 * @param [key] - data key
	 */
	protected loadSettings<T extends object = Dictionary>(key: string = ''): Promise<CanUndef<T>> {
		const
			id = `${this.globalName}_${key}`;

		return this.async.promise(async () => {
			try {
				const res = await this.storage.get<T>(id);
				this.log('settings:load', () => Object.fastClone(res));
				return res;

			} catch {}

		}, {
			label: id,
			group: 'loadSettings',
			join: true
		});
	}

	/**
	 * Returns an object with default component fields for saving to a local storage
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	protected convertStateToStorage(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns an object with default component fields for resetting a local storage
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary {
		return $C(this.convertStateToStorage(data)).map(() => undefined);
	}

	/**
	 * Saves a component state to a local storage
	 * @param [data] - advanced data
	 */
	protected async saveStateToStorage(data?: Dictionary): Promise<void> {
		if (!this.globalName) {
			return;
		}

		data = this.convertStateToStorage(data, 'remote');
		this.setState(this.convertStateToStorage(data));

		await this.saveSettings(data, '[[STORE]]');
		this.log('state:save:storage', this, data);
	}

	/**
	 * Initializes a component state from a local storage
	 */
	protected async initStateFromStorage(): Promise<void> {
		if (!this.globalName) {
			return;
		}

		const
			key = $$.pendingLocalStore;

		if (this[key]) {
			return this[key];
		}

		const
			$a = this.async,
			storeWatchers = {group: 'storeWatchers'};

		$a.clearAll(
			storeWatchers
		);

		return this[key] = $a.promise(async () => {
			const
				data = await this.loadSettings('[[STORE]]');

			this.execCbAtTheRightTime(() => {
				const
					stateFields = this.convertStateToStorage(data);

				this.setState(
					stateFields
				);

				const sync = this.createDeferFn(() => this.saveStateToStorage(), {
					label: $$.syncLocalStore
				});

				$C(stateFields).forEach((el, key) => {
					const
						p = key.split('.');

					if (p[0] === 'mods') {
						$a.on(this.localEvent, `block.mod.*.${p[1]}.*`, sync, storeWatchers);

					} else {
						this.watch(key, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								sync();
							}
						}, storeWatchers);
					}
				});

				this.log('state:init:storage', this, stateFields);
			});

		}, {
			group: 'loadStore',
			join: true
		});
	}

	/**
	 * Resets a component storage state
	 */
	protected async resetStorageState(): Promise<boolean> {
		const
			stateFields = this.convertStateToStorageReset();

		this.setState(
			stateFields
		);

		await this.saveStateToStorage();
		this.log('state:reset:storage', this, stateFields);
		return true;
	}

	/**
	 * Returns an object with default component fields for saving to a router
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	protected convertStateToRouter(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns an object with default component fields for resetting a router
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary {
		return $C(this.convertStateToRouter(data)).map(() => undefined);
	}

	/**
	 * Saves a component state to a router
	 * @param [data] - advanced data
	 */
	protected async saveStateToRouter(data?: Dictionary): Promise<boolean> {
		data = this.convertStateToRouter(data, 'remote');
		this.setState(this.convertStateToRouter(data));

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null, {
			query: data
		});

		this.log('state:save:router', this, data);
		return true;
	}

	/**
	 * Initializes a component state from a router
	 */
	protected initStateFromRouter(): void {
		const
			{async: $a} = this,
			routerWatchers = {group: 'routerWatchers'};

		$a.clearAll(
			routerWatchers
		);

		this.execCbAtTheRightTime(() => {
			const
				p = this.$root.route || {},
				stateFields = this.convertStateToRouter(Object.assign(Object.create(p), p.params, p.query));

			this.setState(stateFields);

			const
				{router} = this.$root;

			if (this.syncRouterStoreOnInit && router) {
				const
					currentRoute = this.$root.route || {},
					routerState = this.convertStateToRouter(stateFields, 'remote');

				if (Object.keys(routerState).length) {
					const
						modState = {};

					for (let keys = Object.keys(routerState), i = 0; i < keys.length; i++) {
						const
							key = keys[i];

						if (currentRoute.params[key] == null && currentRoute.query[key] == null) {
							modState[key] = routerState[key];
						}
					}

					if (Object.keys(modState).length) {
						router.replace(null, {
							query: modState
						});
					}
				}
			}

			const sync = this.createDeferFn(() => this.saveStateToRouter(), {
				label: $$.syncRouter
			});

			$C(stateFields).forEach((el, key) => {
				const
					p = key.split('.');

				if (p[0] === 'mods') {
					$a.on(this.localEvent, `block.mod.*.${p[1]}.*`, sync, routerWatchers);

				} else {
					this.watch(key, (val, oldVal) => {
						if (!Object.fastCompare(val, oldVal)) {
							sync();
						}
					}, routerWatchers);
				}
			});

			this.log('state:init:router', this, stateFields);

		}, {
			label: $$.initStateFromRouter
		});
	}

	/**
	 * Resets a component router state
	 */
	protected async resetRouterState(): Promise<boolean> {
		const
			stateFields = this.convertStateToRouterReset();

		this.setState(
			stateFields
		);

		const
			r = this.$root.router;

		if (!this.isActivated || !r) {
			return false;
		}

		await r.push(null);
		this.log('state:reset:router', this, stateFields);
		return true;
	}

	/**
	 * Wrapper for core/dom -> delegate
	 *
	 * @param selector
	 * @param handler
	 */
	protected delegate(selector: string, handler?: Function): Function {
		return delegate(selector, handler);
	}

	/**
	 * Wraps a handler for delegation of the specified element
	 *
	 * @param elName
	 * @param handler
	 */
	protected delegateElement(elName: string, handler: Function): CanPromise<Function> {
		return this.execCbAfterBlockReady(() => this.delegate(this.block.getElSelector(elName), handler));
	}

	/**
	 * Returns a link to the closest parent component for the current
	 * @param component - component name or a link to the component constructor
	 */
	protected closest<T extends iBlock = iBlock>(component: string | {new: T}): CanUndef<T> {
		const
			isStr = Object.isString(component);

		let el = this.$parent;
		while (el && (
			isStr ?
				el.componentName !== (<string>component).dasherize() :
				!(el.instance instanceof <any>component)
		)) {
			el = el.$parent;
		}

		return <any>el;
	}

	/**
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - component constructor
	 */
	protected isComponent<T extends iBlock>(obj: any, constructor?: {new(): T}): obj is T {
		return Boolean(obj && obj.instance instanceof (constructor || iBlock));
	}

	/**
	 * Returns an instance of a component by the specified element
	 *
	 * @param el
	 * @param [filter]
	 */
	protected $<T extends iBlock>(el: ComponentElement<T>, filter?: string): T;

	/**
	 * Returns an instance of a component by the specified query
	 *
	 * @param query
	 * @param [filter]
	 */
	protected $<T extends iBlock>(query: string, filter?: string): CanUndef<T>;
	protected $<T extends iBlock>(query: string | ComponentElement<T>, filter: string = ''): CanUndef<T> {
		const
			q = Object.isString(query) ? document.body.querySelector<ComponentElement<T>>(query) : query;

		if (q) {
			if (q.component && (q.component.instance instanceof iBlock)) {
				return q.component;
			}

			const
				el = <ComponentElement<T>>q.closest(`.i-block-helper${filter}`);

			if (el) {
				return el.component;
			}
		}

		return undefined;
	}

	/**
	 * Returns if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * @param label
	 * @param [value] - label value (will saved in the cache only if true)
	 */
	protected ifOnce(label: unknown, value: boolean = false): 0 | 1 | 2 {
		if (this.ifOnceStore[<string>label]) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[<string>label] = 1;
		}

		return 0;
	}

	/**
	 * Waits until the specified reference won't be available and returns it
	 *
	 * @see Async.wait
	 * @param ref
	 * @param [params] - async parameters
	 */
	protected async waitRef<T = iBlock | Element | iBlock[] | Element[]>(ref: string, params?: AsyncOpts): Promise<T> {
		await this.async.wait(() => this.$refs[ref], params);
		const link = <any>this.$refs[ref];
		return link.component ? link.component : link;
	}

	/**
	 * Sends an analytic event with the specified parameters
	 *
	 * @param event - event name
	 * @param [details] - event details
	 */
	protected sendAnalyticsEvent(event: string, details: Dictionary = {}): void {
		analytics.send(event, details);
	}

	/**
	 * Initializes core component API
	 */
	@hook('beforeRuntime')
	protected initBaseAPI(): void {
		// @ts-ignore
		this.linksCache = {};

		// @ts-ignore
		this.syncLinkCache = {};

		// @ts-ignore
		this.syncModCache = {};

		const
			i = this.instance;

		this.link = i.link.bind(this);
		this.createWatchObject = i.createWatchObject.bind(this);

		this.isBeforeCreate = i.isBeforeCreate.bind(this);
		this.execCbAfterCreated = i.execCbAfterCreated.bind(this);
		this.execCbAfterBlockReady = i.execCbAfterBlockReady.bind(this);
		this.execCbAtTheRightTime = i.execCbAtTheRightTime.bind(this);

		this.bindModTo = i.bindModTo.bind(this);
		this.getField = i.getField.bind(this);
		this.setField = i.setField.bind(this);
		this.deleteField = i.deleteField.bind(this);

		this.convertStateToStorage = i.convertStateToStorage.bind(this);
		this.initStateFromStorage = i.initStateFromStorage.bind(this);
		this.convertStateToRouter = i.convertStateToRouter.bind(this);

		this.initStateFromRouter = i.initStateFromRouter.bind(this);
		this.setState = i.setState.bind(this);
		this.watch = i.watch.bind(this);

		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.off = i.off.bind(this);
		this.delegate = i.delegate.bind(this);

		// tslint:disable:no-string-literal

		Object.defineProperties(this, {
			refs: {
				get: i['refsGetter']
			},

			globalEvent: {
				get: i['globalEventGetter']
			},

			rootEvent: {
				get: i['rootEventGetter']
			}
		});

		// tslint:enable:no-string-literal
	}

	/**
	 * Synchronizes component link values with linked values
	 *
	 * @param [name] - link name or [linked] | [linked, link]
	 * @param [value] - additional value for sync
	 */
	protected syncLinks(name?: string | [string] | [string, string], value?: unknown): void {
		const
			linkName = <CanUndef<string>>(Object.isString(name) ? name : name && name[1]),
			fieldName = Object.isArray(name) ? name[0] : undefined;

		const
			cache = this.syncLinkCache,
			sync = (el, key) => (!fieldName || key === fieldName) && el.sync(value);

		if (linkName) {
			$C(cache[linkName]).forEach(sync);

		} else {
			$C(cache).forEach((el) => $C(el).forEach(sync));
		}
	}

	/**
	 * Restarts the async render daemon for forcing render
	 */
	protected forceAsyncRender(): void {
		restart();
	}

	/**
	 * Restarts the async render daemon for forcing render
	 * (runs on a next tick)
	 */
	protected deferForceAsyncRender(): void {
		deferRestart();
	}

	/**
	 * Adds a component to the render queue
	 *
	 * @param id - task id
	 * @param [group] - task group
	 */
	protected regAsyncComponent(id: AsyncTaskId, group: AsyncQueueType = 'asyncComponents'): AsyncTaskSimpleId {
		id = Object.isFunction(id) ? id() : id;

		let
			filter,
			simpleId,
			weight;

		if (Object.isObject(id)) {
			simpleId = (<AsyncTaskObjectId>id).id;
			filter = (<AsyncTaskObjectId>id).filter;
			weight = (<AsyncTaskObjectId>id).weight;

		} else {
			simpleId = id;
		}

		weight =
			weight ||
			this.weight ||
			this.isFunctional ? 0.5 : 1;

		const
			cursor = group === 'asyncComponents' ? queue : backQueue,
			store = <Dictionary>this[group];

		if (!(simpleId in store)) {
			const obj = {
				weight,
				fn: this.async.proxy(() => {
					if (filter && !filter(simpleId)) {
						return false;
					}

					store[simpleId] = true;
					return true;

				}, {
					onClear: () => cursor.delete(obj),
					single: false,
					group
				})
			};

			this.$set(store, simpleId, false);
			cursor.add(obj);
		}

		return simpleId;
	}

	/**
	 * Adds a component to the background render queue
	 * @param id - task id
	 */
	protected regAsyncBackComponent(id: AsyncTaskId): AsyncTaskSimpleId {
		return this.regAsyncComponent(id, 'asyncBackComponents');
	}

	/**
	 * Synchronization for the asyncComponents field
	 * @emits asyncRender()
	 */
	@watch({field: 'asyncComponents', deep: true})
	@watch({field: 'asyncBackComponents', deep: true})
	protected syncAsyncComponentsWatcher(): void {
		this.emit('asyncRender');
	}

	/**
	 * Synchronization for the stageStore field
	 *
	 * @param value
	 * @param [oldValue]
	 */
	@watch('!:onStageChange')
	protected syncStageWatcher(value?: Stage, oldValue?: Stage): void {
		this.async.clearAll({group: `stage.${oldValue}`});
	}

	/**
	 * Returns an object with classes for elements of an another component
	 *
	 * @param componentName
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected provideClasses(componentName: string, classes?: Classes): Readonly<Dictionary<string>>;

	/**
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected provideClasses(classes: Classes): Readonly<Dictionary<string>>;
	protected provideClasses(componentName: string | Classes, classes?: Classes): Readonly<Dictionary<string>> {
		if (!Object.isString(componentName)) {
			classes = componentName;
			componentName = this.componentName;
		}

		const
			key = JSON.stringify(classes),
			cache = classesCache.create('base');

		if (cache[key]) {
			return <Readonly<Dictionary<string>>>cache[key];
		}

		const
			map = cache[key] = {};

		if (classes) {
			const
				keys = Object.keys(classes);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = classes[key];

				if (el === true) {
					el = key;

				} else if (Object.isArray(el)) {
					el = el.slice();
					for (let i = 0; i < el.length; i++) {
						if (el[i] === true) {
							el[i] = key;
						}
					}
				}

				map[key.dasherize()] = this.getFullElName.apply(this, (<any[]>[componentName]).concat(el));
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Returns an object with base component modifiers
	 * @param mods - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
	 */
	protected provideMods(mods?: Dictionary<ModVal | Dictionary<ModVal>>): Readonly<ModsNTable> {
		const
			key = JSON.stringify(this.baseMods) + JSON.stringify(mods),
			cache = modsCache[key];

		if (cache) {
			return cache;
		}

		const
			map = modsCache[key] = {...this.baseMods};

		if (mods) {
			const
				keys = Object.keys(mods);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					mod = key.dasherize();

				let
					el = <any>mods[key];

				if (!Object.isObject(el)) {
					el = {default: el};
				}

				// tslint:disable-next-line:prefer-conditional-expression
				if (!(key in mods) || el[key] === undefined) {
					map[mod] = el[Object.keys(el)[0]];

				} else {
					map[mod] = el[key];
				}
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Saves to cache the specified literal and returns returns it
	 * @param literal
	 */
	protected memoizeLiteral<T = unknown>(literal: T): T extends Dictionary ? Readonly<T>: ReadonlyArray<T> {
		const key = JSON.stringify(literal);
		return literalCache[key] = literalCache[key] || Object.freeze(<any>literal);
	}

	/**
	 * Initializes component instance
	 */
	@hook('mounted')
	protected initBlockInstance(): void {
		if (this.block) {
			const
				{node} = this.block;

			if (node === this.$el) {
				return;
			}

			if (node && node.component === this) {
				delete node.component;
			}
		}

		this.block = new Block(this);
		this.localEvent.emit('block.ready');
	}

	/**
	 * Initializes an update from the parent listener
	 */
	@hook('created')
	protected initParentCallEvent(): void {
		this.parentEvent.on('callChild', (component: iBlock, {check, action}: ParentMessage) => {
			if (
				check[0] !== 'instanceOf' && check[1] === this[check[0]] ||
				check[0] === 'instanceOf' && this.instance instanceof <Function>check[1]
			) {
				return action.call(this);
			}
		});
	}

	/**
	 * Initializes global event listeners
	 */
	@hook('created')
	protected initGlobalEvents(): void {
		const
			{globalEvent: $e} = this;

		const waitNextTick = (fn) => async () => {
			try {
				await this.nextTick({label: $$.reset});
				await fn();

			} catch (err) {
				stderr(err);
			}
		};

		$e.on('reset.load', waitNextTick(this.initLoad));
		$e.on('reset.load.silence', waitNextTick(this.reload));
		$e.on('reset.router', this.resetRouterState);
		$e.on('reset.storage', this.resetStorageState);

		$e.on('reset', waitNextTick(async () => {
			this.componentStatus = 'loading';

			await Promise.all([
				this.resetRouterState(),
				this.resetStorageState()
			]);

			await this.initLoad();
		}));

		$e.on('reset.silence', waitNextTick(async () => {
			await Promise.all([
				this.resetRouterState(),
				this.resetStorageState()
			]);

			await this.reload();
		}));
	}

	/**
	 * Initializes modifiers event listeners
	 *
	 * @emits enable()
	 * @emits disable()
	 *
	 * @emits focus()
	 * @emits blur()
	 *
	 * @emits show()
	 * @emits hide()
	 */
	@hook('beforeCreate')
	protected initModEvents(): void {
		const
			{async: $a, localEvent: $e} = this;

		$e.on('block.mod.set.**', (e) => {
			const
				k = e.name,
				v = e.value,
				w = <NonNullable<ModsNTable>>this.getField('watchModsStore');

			this
				.mods[k] = v;

			if (k in w && w[k] !== v) {
				delete w[k];
				this.setField(`watchModsStore.${k}`, v);
			}

			this.emit(`mod-set-${k}-${v}`, e);
		});

		$e.on('block.mod.remove.**', (e) => {
			if (e.reason === 'removeMod') {
				const
					k = e.name,
					w = <NonNullable<ModsNTable>>this.getField('watchModsStore');

				this
					.mods[k] = undefined;

				if (k in w && w[k]) {
					delete w[k];
					this.setField(`watchModsStore.${k}`, undefined);
				}

				this.emit(`mod-remove-${k}-${e.value}`, e);
			}
		});

		$e.on('block.mod.*.disabled.*', (e) => {
			if (e.value === 'false' || e.type === 'remove') {
				$a.off({group: 'blockOnDisable'});
				this.emit('enable');

			} else {
				this.emit('disable');

				const handler = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();
				};

				$a.on(this.$el, 'click mousedown touchstart keydown input change scroll', handler, {
					group: 'blockOnDisable',
					options: {
						capture: true
					}
				});
			}
		});

		$e.on('block.mod.*.focused.*', (e) => {
			this.emit(e.value === 'false' || e.type === 'remove' ? 'blur' : 'focus');
		});

		$e.on('block.mod.*.hidden.*', (e) => {
			this.emit(e.value === 'false' || e.type === 'remove' ? 'show' : 'hide');
		});
	}

	/**
	 * Initializes watchers from .watchProp
	 */
	@hook('beforeDataCreate')
	protected initRemoteWatchers(): void {
		const
			w = this.meta.watchers,
			o = this.watchProp,
			keys = Object.keys(o);

		const normalizeField = (field) => {
			if (customWatcherRgxp.test(field)) {
				return field.replace(customWatcherRgxp, (str, prfx, emitter, event) =>
					`${prfx + ['$parent'].concat(emitter || []).join('.')}:${event}`);
			}

			return `$parent.${field}`;
		};

		for (let i = 0; i < keys.length; i++) {
			const
				method = keys[i],
				watchers = (<any[]>[]).concat((<MethodWatchers>o[method]) || []);

			for (let i = 0; i < watchers.length; i++) {
				const
					el = watchers[i],
					isStr = Object.isString(el);

				const
					field = normalizeField(isStr ? el : el.field),
					wList = w[field] = w[field] || [];

				if (Object.isString(el)) {
					wList.push({
						method,
						handler: method
					});

				} else {
					wList.push({
						...el,
						args: [].concat(el.args || []),
						method,
						handler: method
					});
				}
			}
		}
	}

	/**
	 * Returns true if the component hook is equal one of "before" hooks
	 * @param [skip] - name of a skipped hook
	 */
	protected isBeforeCreate(...skip: Hooks[]): boolean {
		const
			hooks = {beforeRuntime: true, beforeCreate: true, beforeDataCreate: true};

		for (let i = 0; i < skip.length; i++) {
			hooks[skip[i]] = false;
		}

		return Boolean(hooks[this.hook]);
	}

	/**
	 * Executes the specified callback after created hook and returns the result
	 *
	 * @param cb
	 * @param [params] - async parameters
	 */
	protected execCbAfterCreated<T = unknown>(cb: (this: this) => T, params?: AsyncOpts): CanPromise<T> {
		if (this.isBeforeCreate()) {
			return <any>this.$async.promise(new Promise((r) => {
				this.meta.hooks.created.unshift({fn: () => r(cb.call(this))});
			}), params).catch(stderr);
		}

		return cb.call(this);
	}

	/**
	 * Executes the specified callback after block.ready event and returns the result
	 *
	 * @param cb
	 * @param [params] - async parameters
	 */
	protected execCbAfterBlockReady<T = unknown>(cb: (this: this) => T, params?: AsyncOpts): CanPromise<T> {
		if (this.block) {
			return cb.call(this);
		}

		return <any>this.$async.promise(new Promise((r) => {
			this.localEvent.once('block.ready', () => r(cb.call(this)));
		}), params).catch(stderr);
	}

	/**
	 * Component created
	 */
	protected created(): void {
		return undefined;
	}

	/**
	 * Component mounted to DOM
	 */
	protected mounted(): void {
		return undefined;
	}

	/**
	 * Component activated
	 * (for keep-alive)
	 */
	protected activated(): void {
		if (this.isActivated) {
			return;
		}

		this.async.unmuteAll().unsuspendAll();
		this.componentStatus = 'beforeReady';

		if (this.needReInit) {
			this.async.setImmediate(() => {
				const
					v = this.reload();

				if (Object.isPromise(v)) {
					v.catch(stderr);
				}

			}, {
				label: $$.activated
			});
		}

		if (!{beforeReady: true, ready: true}[this.componentStatus]) {
			this.componentStatus = 'beforeReady';
		}

		this.componentStatus = 'ready';
		this.isActivated = true;
	}

	/**
	 * Component deactivated
	 * (for keep-alive)
	 */
	protected deactivated(): void {
		const
			$a = this.async,
			names = Async.linkNames;

		const mute = {
			[names.promise]: true,
			[names.request]: true
		};

		for (let keys = Object.keys(names), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (mute[key]) {
				continue;
			}

			const
				fn = $a[`mute-${names[key]}`.camelize(false)];

			if (Object.isFunction(fn)) {
				fn.call($a);
			}
		}

		$a
			.unmuteAll({group: /:suspend(?:\b|$)/})
			.suspendAll();

		this.componentStatus = 'inactive';
		this.isActivated = false;
	}

	/**
	 * Component before destroy
	 */
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
		this.async.clearAll();
		this.localEvent.removeAllListeners();
		delete (<StrictDictionary<any>>classesCache).dict.els[this.componentId];
	}
}

/**
 * Hack for i-component decorators
 */
export abstract class iBlockDecorator extends iBlock {
	public readonly h!: typeof helpers;
	public readonly b!: typeof browser;
	public readonly t!: typeof i18n;

	public readonly meta!: ComponentMeta;
	public readonly linksCache!: Dictionary<Dictionary>;
	public readonly syncLinkCache!: SyncLinkCache;
	public readonly $attrs!: Dictionary<string>;

	public readonly async!: Async<this>;
	public readonly block!: Block;
	public readonly localEvent!: EventEmitter;

	public delegate(selector: string, handler?: Function): Function {
		return () => ({});
	}

	public delegateElement(elName: string, handler: Function): CanPromise<Function> {
		return () => ({});
	}
}

function defaultI18n(): string {
	return (this.$root.i18n || i18n).apply(this.$root, arguments);
}
