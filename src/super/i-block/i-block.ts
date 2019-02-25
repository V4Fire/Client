/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import symbolGenerator from 'core/symbol';

import Async, { AsyncOpts, ClearOptsId, WrappedFunction, ProxyCb } from 'core/async';
import log, { LogMessageOptions } from 'core/log';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

//#if runtime has core/analytics
import * as analytics from 'core/analytics';
//#endif

//#if runtime has core/helpers
import * as helpers from 'core/helpers';
//#endif

//#if runtime has core/browser
import * as browser from 'core/browser';
//#endif

//#if runtime has core/kv-storage
import { asyncLocal, AsyncNamespace } from 'core/kv-storage';
//#endif

//#if runtime has bRouter
import bRouter, { CurrentPage } from 'base/b-router/b-router';
//#endif

//#if runtime has iStaticPage
import iStaticPage from 'super/i-static-page/i-static-page';
//#endif

import 'super/i-block/directives';

import Daemons, { DaemonsDict } from 'super/i-block/modules/daemons';
import Block from 'super/i-block/modules/block';
import Cache from 'super/i-block/modules/cache';

import { GLOBAL } from 'core/const/links';
import { statuses } from 'super/i-block/modules/const';

import {

	Classes,
	SyncLinkCache,
	ModsTable,
	ModsNTable,
	Statuses,
	WaitStatusOpts,
	AsyncWatchOpts,
	RemoteEvent,
	Event,
	ConverterCallType,
	Stage,
	BindModCb

} from 'super/i-block/modules/interface';

import {

	component,
	PARENT,

	globalEvent,
	hook,
	ModsDecl,

	ComponentInterface,
	ComponentElement,
	ComponentMeta

} from 'core/component';

import { prop, field, system, watch, wait, p, MethodWatchers } from 'super/i-block/modules/decorators';

import Life from 'super/i-block/modules/life';
import Field from 'super/i-block/modules/field';
import { mergeMods, initMods, getWatchableMods } from 'super/i-block/modules/mods';
import { activate, deactivate, onActivated, onDeactivated } from 'super/i-block/modules/keep-alive';
import { eventFactory } from 'super/i-block/modules/event';

export * from 'core/component';
export * from 'super/i-block/modules/interface';
export * from 'super/i-block/modules/daemons';
export * from 'super/i-block/modules/block';

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

export interface RouteParams {
	params?: Dictionary;
	query?: Dictionary;
}

export const
	$$ = symbolGenerator(),
	modsCache = Object.createDict<ModsNTable>();

const classesCache = new Cache<'base' | 'blocks' | 'els', ReadonlyArray<string> | Readonly<Dictionary<string>>>([
	'base',
	'blocks',
	'els'
]);

@component()
export default class iBlock extends ComponentInterface<iBlock, iStaticPage> {
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
		return this.shadowComponentStatusStore || <NonNullable<Statuses>>this.field.get('componentStatusStore');
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
			this.field.set('componentStatusStore', value);
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
		return this.field.get('stageStore');
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

		this.field.set('stageStore', value);
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
		o.life.execCbAtTheRightTime(() => {
			if (o.isFunctional && !o.field.get('forceSelfActivation')) {
				return;
			}

			if (o.field.get('isActivated')) {
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
		return <NonNullable<Dictionary>>this.field.get('pStore');
	}

	/**
	 * Sets the internal advanced parameters store value
	 */
	set p(value: Dictionary) {
		this.field.set('pStore', value);
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
		return this.field.get('routerStore', this.$root);
	}

	/**
	 * Link to the root route object
	 */
	@p({cache: false})
	get route(): CanUndef<CurrentPage | any> {
		return this.field.get('route', this.$root);
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
	@system({merge: mergeMods, init: initMods})
	readonly mods!: ModsNTable;

	/**
	 * API for component life cycle helpers
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Life(ctx)
	})

	readonly life!: Life;

	/**
	 * API for component field accessors
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Field(ctx)
	})

	readonly field!: Field;

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
		status: [
			['unloaded'],
			'loading',
			'beforeReady',
			'ready',
			'inactive',
			'destroyed'
		]
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

				const component = (<ComponentElement>el).component;
				res[key] = component && (<iBlock>component).$el === el ? component : <Element>el;
			}
		}

		return res;
	}

	/**
	 * Render counter (for forceUpdate)
	 */
	@field()
	protected renderCounter: number = 0;

	/**
	 * Advanced component parameters internal storage
	 */
	@field((o) => o.sync.link())
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
		return getWatchableMods(this);
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
		after: 'async',
		unique: true,
		init: (o, d) => eventFactory(<Async>d.async, new EventEmitter({
			maxListeners: 100,
			wildcard: true
		}))
	})

	protected readonly localEvent!: Event<this>;

	/**
	 * Global event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => eventFactory(<Async>d.async, globalEvent)
	})

	protected readonly globalEvent!: Event<this>;

	/**
	 * Root event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => eventFactory(<Async>d.async, o.$root)
	})

	protected readonly rootEvent!: Event<this>;

	/**
	 * Parent event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => eventFactory(<Async>d.async, () => o.$parent)
	})

	protected readonly parentEvent!: Event<this>;

	/**
	 * Storage object
	 */
	@system({
		atom: true,
		unique: true,

		// tslint:disable-next-line:arrow-return-shorthand
		init: (o) => {
			//#if runtime has core/has kv-storage
			return asyncLocal.namespace(o.componentName);
			//#endif
		}
	})

	protected readonly storage!: CanUndef<AsyncNamespace>;

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
		init: () => {
			//#if runtime has core/helpers
			return helpers;
			//#endif

			//#unless runtime has core/helpers
			return {};
			//#endunless
		}
	})

	protected readonly h!: typeof helpers;

	/**
	 * Browser constants
	 */
	@system({
		atom: true,
		unique: true,
		init: () => {
			//#if runtime has core/browser
			return browser;
			//#endif

			//#unless runtime has core/browser
			return {};
			//#endunless
		}
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
		init: () => GLOBAL.l
	})

	protected readonly l!: typeof l;

	/**
	 * Link to window.Symbol
	 */
	@system({
		atom: true,
		unique: true,
		init: () => Symbol
	})

	protected readonly Symbol!: Function;

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
				p = params || {},
				fork = (obj) => Object.mixin(true, undefined, obj);

			let
				oldVal: unknown = fork(this.field.get(Object.isFunction(exprOrFn) ? exprOrFn.call(this) : exprOrFn));

			const watchParams = {
				handler(val: unknown, defOldVal: unknown): unknown {
					if (val !== defOldVal) {
						oldVal = defOldVal;
						return cb.call(this, val, defOldVal);
					}

					const res = cb.call(this, val, oldVal);
					oldVal = fork(val);
					return res;
				},

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
		converter: BindModCb<V, R, CTX> | AsyncWatchOpts = (v) => v != null ? Boolean(v) : undefined,
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
				val = fn(val, this);

				if (val !== undefined) {
					this.setMod(mod, val);
				}

			}, params);
		};

		if (this.isBeforeCreate()) {
			const sync = this.syncModCache[mod] = () => {
				const
					v = fn(this.field.get(field), this);

				if (v !== undefined) {
					this.mods[mod] = String(v);
				}
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

		const
			nm = this.componentName,
			globalNm = (this.globalName || '').dasherize();

		while (obj) {
			if (obj.selfDispatching) {
				obj.$emit(event, this, ...args);
				obj.$emit(`on-${event}`, this, ...args);
				obj.log(`event:${event}`, this, ...args);

			} else {
				obj.$emit(`${nm}::${event}`, this, ...args);
				obj.$emit(`${nm}::on-${event}`, this, ...args);
				obj.log(`event:${nm}::${event}`, this, ...args);

				if (globalNm) {
					obj.$emit(`${globalNm}::${event}`, this, ...args);
					obj.$emit(`${globalNm}::on-${event}`, this, ...args);
					obj.log(`event:${globalNm}::${event}`, this, ...args);
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
			this.$nextTick($a.proxy(<WrappedFunction>cbOrParams, params));
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

			this.life.execCbAtTheRightTime(() => this.emit('dbReady', get(), silent));
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
					await $a.wait(() => {
						for (let o = providers.values(), el = o.next(); !el.done; el = o.next()) {
							const
								val = el.value,
								st = <string>val.componentStatus;

							if (st === 'ready' || statuses[st] <= 0) {
								providers.delete(val);
								continue;
							}

							return false;
						}

						return true;
					});
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
	setMod(nodeOrName: Element | string, name: string | unknown, value?: unknown): CanPromise<boolean | void> {
		if (Object.isString(nodeOrName)) {
			return this.execCbAfterBlockReady(() => this.block.setMod(nodeOrName, name)) || false;
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
	removeMod(nodeOrName: Element | string, name?: string | unknown, value?: unknown): CanPromise<boolean | void> {
		if (Object.isString(nodeOrName)) {
			return this.execCbAfterBlockReady(() => this.block.removeMod(nodeOrName, name)) || false;
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
		activate(this, force);
	}

	/**
	 * Deactivates the component
	 */
	deactivate(): void {
		deactivate(this);
	}

	/**
	 * Puts the specified parameters to log
	 *
	 * @param ctxOrOpts - log context or log options (logLevel, context)
	 * @param [details]
	 */
	protected log(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void {
		let
			context = ctxOrOpts,
			logLevel;

		if (!Object.isString(ctxOrOpts)) {
			logLevel = ctxOrOpts.logLevel;
			context = ctxOrOpts.context;
		}

		log(
			{
				context: ['component', context, this.componentName].join(':'),
				logLevel
			},

			...details,
			this
		);

		if (this.globalName) {
			log(
				{
					context: ['component:global', this.globalName, context, this.componentName].join(':'),
					logLevel
				},

				...details,
				this
			);
		}
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
	protected convertStateToStorageReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.convertStateToStorage(data),
			res = {};

		if (stateFields) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * Returns an object with default component fields for saving to a router
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	protected convertStateToRouter(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns an object with default component fields for resetting a router
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.convertStateToRouter(data),
			res = {};

		if (stateFields) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - component constructor
	 */
	protected isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T}): obj is T {
		return Boolean(obj && (<Dictionary>obj).instance instanceof (constructor || iBlock));
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

		const
			link = <T>this.$refs[ref];

		if (link instanceof Element) {
			return (<ComponentElement<T>>link).component || link;
		}

		return link;
	}

	/**
	 * Sends an analytic event with the specified parameters
	 *
	 * @param event - event name
	 * @param [details] - event details
	 */
	protected sendAnalyticsEvent(event: string, details: Dictionary = {}): void {
		//#if runtime has core/analytics
		analytics.send(event, details);
		//#endif
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

		this.bindModTo = i.bindModTo.bind(this);
		this.convertStateToStorage = i.convertStateToStorage.bind(this);
		this.convertStateToRouter = i.convertStateToRouter.bind(this);

		this.watch = i.watch.bind(this);

		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.off = i.off.bind(this);

		// tslint:disable:no-string-literal

		Object.defineProperties(this, {
			refs: {
				get: i['refsGetter']
			}
		});

		// tslint:enable:no-string-literal
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
	 * Component activated hook
	 * (for keep-alive)
	 */
	protected activated(): void {
		onActivated(this);
	}

	/**
	 * Component deactivated hook
	 * (for keep-alive)
	 */
	protected deactivated(): void {
		onDeactivated(this);
	}

	/**
	 * Component before destroy
	 */
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
		this.async.clearAll().locked = true;

		if (classesCache.dict && classesCache.dict.els) {
			delete classesCache.dict.els[this.componentId];
		}
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

	public readonly localEvent!: Event<this>;
	public readonly globalEvent!: Event<this>;
	public readonly rootEvent!: Event<this>;
}

function defaultI18n(): string {
	return (this.$root.i18n || GLOBAL.i18n).apply(this.$root, arguments);
}
