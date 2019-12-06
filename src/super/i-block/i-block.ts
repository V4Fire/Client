/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import symbolGenerator from 'core/symbol';

import Async, { AsyncOptions, ClearOptionsId, WrappedFunction, ProxyCb } from 'core/async';
import log, { LogMessageOptions } from 'core/log';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

//#if runtime has core/helpers
import * as helpers from 'core/helpers';
//#endif

//#if runtime has core/browser
import * as browser from 'core/browser';
//#endif

//#if runtime has bRouter
import bRouter, { CurrentPage } from 'base/b-router/b-router';
//#endif

//#if runtime has iStaticPage
import iStaticPage from 'super/i-static-page/i-static-page';
//#endif

import 'super/i-block/directives';
import * as presets from 'presets';

import Cache from 'super/i-block/modules/cache';
import Opt from 'super/i-block/modules/opt';
import Lazy from 'super/i-block/modules/lazy';

import Daemons, { DaemonsDict } from 'super/i-block/modules/daemons';
import Analytics from 'super/i-block/modules/analytics';

import DOM from 'super/i-block/modules/dom';
import VDOM from 'super/i-block/modules/vdom';

import Lfc from 'super/i-block/modules/lfc';
import AsyncRender from 'super/i-block/modules/async-render';

import Block from 'super/i-block/modules/block';
import Field from 'super/i-block/modules/field';

import Provide, { classesCache, Classes, Styles } from 'super/i-block/modules/provide';
import State, { ConverterCallType } from 'super/i-block/modules/state';
import Storage from 'super/i-block/modules/storage';
import Sync, { AsyncWatchOptions } from 'super/i-block/modules/sync';

import { statuses } from 'super/i-block/modules/const';
import { eventFactory, Event, RemoteEvent } from 'super/i-block/modules/event';
import { initGlobalEvents, initRemoteWatchers } from 'super/i-block/modules/listeners';
import { activate, deactivate, onActivated, onDeactivated } from 'super/i-block/modules/keep-alive';
import {

	Statuses,
	WaitStatusOptions,
	Stage,
	ParentMessage,
	ComponentStatuses,
	ComponentEventDecl,
	InitLoadParams

} from 'super/i-block/modules/interface';

import {

	mergeMods,
	initMods,
	getWatchableMods,

	ModVal,
	ModsDecl,
	ModsTable,
	ModsNTable

} from 'super/i-block/modules/mods';

import {

	component,
	PARENT,

	globalEvent,
	hook,
	getFieldInfo,
	cloneWatchValue,
	bindWatchers,

	FieldInfo,
	ComponentMeta,
	ComponentInterface,

	VNode,
	WatchOptionsWithHandler

} from 'core/component';

import {

	prop,
	field,
	system,
	watch,
	wait,
	p,
	MethodWatchers

} from 'super/i-block/modules/decorators';

export * from 'core/component';
export * from 'super/i-block/modules/interface';
export * from 'super/i-block/modules/const';

export * from 'super/i-block/modules/block';
export * from 'super/i-block/modules/field';
export * from 'super/i-block/modules/state';

export * from 'super/i-block/modules/daemons';
export * from 'super/i-block/modules/event';

export * from 'super/i-block/modules/sync';
export * from 'super/i-block/modules/async-render';

export {

	Cache,
	Classes,

	ModVal,
	ModsDecl,
	ModsTable,
	ModsNTable

};

export {

	p,
	prop,
	field,
	system,
	watch,
	wait,
	mod,
	removeMod

} from 'super/i-block/modules/decorators';

export const
	$$ = symbolGenerator(),
	modsCache = Object.createDict<ModsNTable>();

const
	isCustomWatcher = /:/,
	readyStatuses = {beforeReady: true, ready: true};

@component()
export default abstract class iBlock extends ComponentInterface<iBlock, iStaticPage> {
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
	 * Component render cache key
	 */
	@prop({required: false})
	readonly renderKey?: string;

	/**
	 * Component unique name
	 */
	@prop({type: String, required: false})
	readonly globalName?: string;

	/**
	 * If true, then the current component is activated
	 */
	@prop(Boolean)
	readonly activatedProp: boolean = true;

	/**
	 * If true, then if the component is functional it won't be destroyed after removal from DOM
	 */
	@prop(Boolean)
	readonly keepAlive: boolean = false;

	/**
	 * If true, then the component will reload data after an activated hook
	 */
	@prop(Boolean)
	readonly reloadOnActivation: boolean = false;

	/**
	 * If true, then the component will be listen a parent component for proxy events
	 */
	@prop(Boolean)
	readonly proxyCall: boolean = false;

	/**
	 * Initial component modifiers
	 */
	@prop({type: Object, required: false})
	readonly modsProp?: ModsTable;

	/**
	 * Remote watchers table
	 */
	@prop({type: Object, required: false})
	readonly watchProp?: Dictionary<MethodWatchers>;

	/**
	 * Initial component stage
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

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
	 * If true, then the component state will be synchronized with the router after initializing
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

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
	 * Additional classes for component elements
	 */
	@prop({type: Object, required: false})
	readonly classes?: Classes;

	/**
	 * Additional styles for component elements
	 */
	@prop({type: Object, required: false})
	readonly styles?: Styles;

	/**
	 * Advanced component parameters
	 */
	@prop({type: Object, required: false})
	readonly p?: Dictionary;

	/**
	 * Link to i18n function
	 */
	@prop(Function)
	readonly i18n: typeof i18n = defaultI18n;

	/**
	 * Link to the remote state object
	 */
	get remoteState(): Dictionary {
		return this.$root.remoteState;
	}

	/**
	 * Component initialize status
	 */
	@p({cache: false, replace: false})
	get componentStatus(): Statuses {
		return this.shadowComponentStatusStore || <NonNullable<Statuses>>this.field.get('componentStatusStore');
	}

	/**
	 * Sets a new component initialize status
	 *
	 * @param value
	 * @emits status${$value}(value: Statuses)
	 */
	set componentStatus(value: Statuses) {
		const
			old = this.componentStatus;

		if (old === value && value !== 'beforeReady') {
			return;
		}

		const
			isShadowStatus = (<typeof iBlock>this.instance.constructor).shadowComponentStatuses[value];

		if (isShadowStatus || value === 'ready' && old === 'beforeReady') {
			this.shadowComponentStatusStore = value;

		} else {
			this.shadowComponentStatusStore = undefined;
			this.field.set('componentStatusStore', value);
		}

		if (!this.isFlyweight) {
			this.setMod('status', value);
			this.emit(`status-${value}`, value);
		}
	}

	/**
	 * Component stage store
	 */
	@p({cache: false, replace: false})
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

		this.async.clearAll({group: `stage.${oldValue}`});
		this.field.set('stageStore', value);
		this.emit('stageChange', value, oldValue);
	}

	/**
	 * Group name for the current stage
	 */
	@p({replace: false})
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * True if the current component is activated
	 */
	@system((o) => {
		o.lfc.execCbAtTheRightTime(() => {
			if (o.isFunctional && !o.field.get('forceInitialActivation')) {
				return;
			}

			if (o.field.get('isActivated')) {
				o.activate(true);

			} else {
				o.deactivate();
			}
		});

		return o.sync.link('activatedProp', (val) => {
			if (o.hook !== 'beforeDataCreate') {
				o[val ? 'activate' : 'deactivate']();
			}

			return val;
		});
	})

	isActivated!: boolean;

	/**
	 * True, if the component was initialized at least once
	 */
	@system()
	isInitializedOnce: boolean = false;

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
	get router(): bRouter {
		return <bRouter>this.field.get('routerStore', this.$root);
	}

	/**
	 * Link to the root route object
	 */
	@p({cache: false})
	get route(): CanUndef<CurrentPage> {
		return this.field.get('route', this.$root);
	}

	/**
	 * True if the current component is ready (componentStatus == ready)
	 */
	@p({cache: false, replace: false})
	get isReady(): boolean {
		return Boolean(readyStatuses[this.componentStatus]);
	}

	/**
	 * True if the current component is functional
	 */
	@p({replace: false})
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * True if the current component is flyweight
	 */
	@p({replace: false})
	get isFlyweight(): boolean {
		return Boolean(this.$isFlyweight);
	}

	/**
	 * Base component modifiers
	 */
	@p({replace: false})
	get baseMods(): CanUndef<Readonly<ModsNTable>> {
		const
			m = this.mods;

		let
			res;

		if (m.theme) {
			res = {theme: m.theme};
		}

		return res && Object.freeze(res);
	}

	/**
	 * Component modifiers
	 */
	@system({
		replace: false,
		merge: mergeMods,
		init: initMods
	})

	readonly mods!: ModsNTable;

	/**
	 * API for component life cycle helpers
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Lfc(ctx)
	})

	readonly lfc!: Lfc;

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
	 * API for component option providers
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Provide(ctx)
	})

	readonly provide!: Provide;

	/**
	 * API for component option providers
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Sync(ctx)
	})

	readonly sync!: Sync;

	/**
	 * API for async render
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		functional: false,
		init: (ctx: iBlock) => new AsyncRender(ctx)
	})

	readonly asyncRender!: AsyncRender;

	/**
	 * API for component VDOM operations
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new VDOM(ctx)
	})

	readonly vdom!: VDOM;

	/**
	 * Parent link
	 */
	static readonly PARENT: object = PARENT;

	/**
	 * Component shadow statuses
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
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
		],

		diff: [
			'true',
			'false'
		],

		theme: [],
		exterior: []
	};

	/**
	 * Component daemons
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * API for a component storage
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx: iBlock) => new Storage(ctx)
	})

	protected readonly storage!: Storage;

	/**
	 * API for a component state
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx: iBlock) => new State(ctx)
	})

	protected readonly state!: State;

	/**
	 * API for component DOM operations
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new DOM(ctx)
	})

	protected readonly dom!: DOM;

	/**
	 * API for analytics
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Analytics(ctx)
	})

	protected readonly analytics!: Analytics;

	/**
	 * API for lazy operations
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx: iBlock) => new Lazy(ctx)
	})

	protected readonly lazy!: Lazy;

	/**
	 * API for optimize operations
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx: iBlock) => new Opt(ctx)
	})

	protected readonly opt!: Opt;

	/**
	 * Render counter (for forceUpdate)
	 */
	@field({functional: false})
	protected renderCounter: number = 0;

	/**
	 * Component stage store
	 */
	@field({
		replace: false,
		init: (o) => o.sync.link((val, old) => {
			if (val === old) {
				return;
			}

			o.emit('stageChange', val, old);
			return val;
		})
	})

	protected stageStore?: Stage;

	/**
	 * Number of beforeReady event listeners
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * Component initialize status store
	 */
	@field({unique: true})
	protected componentStatusStore: Statuses = 'unloaded';

	/**
	 * Component initialize status store for non watch statuses
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: Statuses;

	/**
	 * Watched store of component modifiers
	 */
	@field({merge: true, replace: false})
	protected watchModsStore: ModsNTable = {};

	/**
	 * Watched component modifiers
	 */
	@p({replace: false})
	protected get m(): Readonly<ModsNTable> {
		return getWatchableMods(this);
	}

	/**
	 * Cache of ifOnce
	 */
	@field({merge: true, replace: false})
	protected readonly ifOnceStore: Dictionary = {};

	/**
	 * Temporary cache
	 */
	@system({
		merge: true,
		replace: false,
		init: () => Object.createDict()
	})

	protected tmp!: Dictionary;

	/**
	 * Render temporary cache
	 */
	@system({
		merge: true,
		replace: false,
		init: () => Object.createDict()
	})

	protected renderTmp!: Dictionary<VNode>;

	/**
	 * Temporary cache with watching
	 */
	@field({merge: true})
	protected watchTmp: Dictionary = {};

	/**
	 * Cache for watch values
	 */
	@system({
		merge: true,
		replace: false,
		init: () => Object.createDict()
	})

	protected watchCache!: Dictionary;

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
		replace: true,
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
		replace: true,
		init: (ctx) => new Daemons(ctx)
	})

	protected daemons!: Daemons;

	/**
	 * List of block ready listeners
	 */
	@system({unique: true})
	protected blockReadyListeners: Function[] = [];

	/**
	 * Local event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => eventFactory(<Async>d.async, new EventEmitter({
			maxListeners: 1e3,
			newListener: false,
			wildcard: true
		}), {suspend: true})
	})

	protected readonly localEvent!: Event<this>;

	/**
	 * Global event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		replace: true,
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
		replace: true,
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
		init: (o, d) => eventFactory(<Async>d.async, () => o.$parent, true)
	})

	protected readonly parentEvent!: RemoteEvent<this>;

	/**
	 * Browser constants
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => {
			//#if runtime has core/browser
			return browser;
			//#endif

			//#unless runtime has core/browser
			return {};
			//#endunless
		}
	})

	protected readonly browser!: typeof browser;

	/**
	 * Presets table
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => presets
	})

	protected readonly preset!: typeof presets;

	/**
	 * Some helpers
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
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
	 * Alias for .i18n
	 */
	@system({
		atom: true,
		after: 'sync',
		init: (o, d) => (<Sync>d.sync).link('i18n')
	})

	protected readonly t!: typeof i18n;

	/**
	 * Link to window.l
	 */
	@system({
		atom: true,
		unique: true,
		replace: true
	})

	protected readonly l: typeof l = globalThis.l;

	/**
	 * Link to console API
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => console
	})

	protected readonly console!: Console;

	/**
	 * Link to window.location
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => location
	})

	protected readonly location!: Location;

	/**
	 * Link to the global object
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => globalThis
	})

	protected readonly global!: Window;

	/**
	 * Sets a watcher to an event or a field
	 *
	 * @see Async.worker
	 * @param exprOrFn
	 * @param cb
	 * @param [params] - additional parameters
	 */
	@p({replace: false})
	watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		cb: (this: this, n: T, o?: T) => void,
		params?: AsyncWatchOptions
	): void {
		if (this.isFlyweight) {
			return;
		}

		const
			p = params || {};

		let
			info;

		if (Object.isString(exprOrFn) && (
			isCustomWatcher.test(exprOrFn) ||
			(info = getFieldInfo(exprOrFn, this)).type === 'system')
		) {
			if (info && info.type === 'prop' && (
				// @ts-ignore (access)
				info.ctx.meta.params.root ||
				!(info.name in (info.ctx.$options.propsData || {}))
			)) {
				if (p.immediate) {
					cb.call(this, this.field.get(exprOrFn));
				}

				return;
			}

			bindWatchers(this, {
				info,
				async: <Async<any>>this.async,
				watchers: {
					[exprOrFn]: [{
						handler: (ctx, ...args: unknown[]) => cb.call(this, ...args),
						...p
					}]
				}
			});

			return;
		}

		if (info && info.type === 'prop' && (
			// @ts-ignore (access)
			info.ctx.meta.params.root ||
			!(info.name in (info.ctx.$options.propsData || {}))
		)) {
			if (p.immediate) {
				cb.call(this, this.field.get(<string>exprOrFn));
			}

			return;
		}

		this.lfc.execCbAfterComponentCreated(() => {
			const watcher = this.$$watch(exprOrFn, {
				handler: cb,
				deep: p.deep,
				immediate: p.immediate
			});

			if (p.group || p.label || p.join) {
				this.async.worker(watcher, {group: p.group, label: p.label, join: p.join});
			}
		});
	}

	/**
	 * Emits a component event
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	emit(event: string | ComponentEventDecl, ...args: unknown[]): void {
		const
			decl = Object.isString(event) ? {event} : event,
			eventNm = decl.event = decl.event.dasherize();

		this.$emit(eventNm, this, ...args);
		this.$emit(`on-${eventNm}`, ...args);
		this.dispatching && this.dispatch(decl, ...args);

		const
			logArgs = args.slice();

		if (decl.type === 'error') {
			for (let i = 0; i < logArgs.length; i++) {
				const
					el = logArgs[i];

				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			}
		}

		this.log(`event:${eventNm}`, this, ...logArgs);
	}

	/**
	 * Emits a component error event
	 * (all functions from args will be wrapped for logging)
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	emitError(event: string, ...args: unknown[]): void {
		this.emit({event, type: 'error'}, ...args);
	}

	/**
	 * Emits the specified event for the parent component
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	dispatch(event: string | ComponentEventDecl, ...args: unknown[]): void {
		const
			decl = Object.isString(event) ? {event} : event,
			eventNm = decl.event = decl.event.dasherize();

		let
			obj = this.$parent;

		const
			nm = this.componentName,
			globalNm = (this.globalName || '').dasherize();

		const
			logArgs = args.slice();

		if (decl.type === 'error') {
			for (let i = 0; i < logArgs.length; i++) {
				const
					el = logArgs[i];

				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			}
		}

		while (obj) {
			if (obj.selfDispatching) {
				obj.$emit(eventNm, this, ...args);
				obj.$emit(`on-${eventNm}`, ...args);
				obj.log(`event:${eventNm}`, this, ...logArgs);

			} else {
				obj.$emit(`${nm}::${eventNm}`, this, ...args);
				obj.$emit(`${nm}::on-${eventNm}`, ...args);
				obj.log(`event:${nm}::${eventNm}`, this, ...logArgs);

				if (globalNm) {
					obj.$emit(`${globalNm}::${eventNm}`, this, ...args);
					obj.$emit(`${globalNm}::on-${eventNm}`, ...args);
					obj.log(`event:${globalNm}::${eventNm}`, this, ...logArgs);
				}
			}

			if (!obj.dispatching) {
				break;
			}

			obj = obj.$parent;
		}
	}

	/**
	 * Attaches an event listener to the specified component event
	 *
	 * @see Async.on
	 * @param event
	 * @param cb
	 * @param [params] - async parameters
	 */
	@p({replace: false})
	on<E = unknown, R = unknown>(event: string, cb: ProxyCb<E, R, any>, params?: AsyncOptions): void {
		event = event.dasherize();

		if (params) {
			this.async.on(this, event, cb, params);
			return;
		}

		this.$on(event, cb);
	}

	/**
	 * Attaches a single event listener to the specified component event
	 *
	 * @see Async.on
	 * @param event
	 * @param cb
	 * @param [params] - async parameters
	 */
	@p({replace: false})
	once<E = unknown, R = unknown>(event: string, cb: ProxyCb<E, R, any>, params?: AsyncOptions): void {
		event = event.dasherize();

		if (params) {
			this.async.once(this, event, cb, params);
			return;
		}

		this.$once(event, cb);
	}

	/**
	 * Attaches a single event listener to the specified component event and returns a promise
	 *
	 * @see Async.on
	 * @param event
	 * @param [params] - async parameters
	 */
	@p({replace: false})
	promisifyOnce<T = unknown>(event: string, params?: AsyncOptions): Promise<T> {
		event = event.dasherize();
		return this.async.promisifyOnce(this, event, params);
	}

	/**
	 * Detaches the specified event listeners
	 *
	 * @param [event]
	 * @param [cb]
	 */
	off(event?: string, cb?: Function): void;

	/**
	 * @see Async.off
	 * @param [params] - async parameters
	 */
	off(params: ClearOptionsId<object>): void;

	@p({replace: false})
	off(eventOrParams?: string | ClearOptionsId<object>, cb?: Function): void {
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
	waitStatus(status: Statuses, params?: WaitStatusOptions): Promise<void>;

	/**
	 * @see Async.promise
	 * @param status
	 * @param cb
	 * @param [params] - additional parameters:
	 *   *) [params.defer] - if true, then the function will always return a promise
	 */
	waitStatus<T = unknown>(status: Statuses, cb: (this: this) => T, params?: WaitStatusOptions): CanPromise<T>;

	@p({replace: false})
	waitStatus<T = unknown>(
		status: Statuses,
		cbOrParams?: Function | WaitStatusOptions,
		params?: WaitStatusOptions
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
	 * Executes the specified function on a next render tick
	 *
	 * @see Async.proxy
	 * @param cb
	 * @param [params] - async parameters
	 */
	nextTick(cb: WrappedFunction, params?: AsyncOptions): void;

	/**
	 * @see Async.promise
	 * @param [params] - async parameters
	 */
	nextTick(params?: AsyncOptions): Promise<void>;
	nextTick(cbOrParams?: WrappedFunction | AsyncOptions, params?: AsyncOptions): CanPromise<void> {
		const
			{async: $a} = this;

		if (cbOrParams && Object.isFunction(cbOrParams)) {
			this.$nextTick($a.proxy(<WrappedFunction>cbOrParams, params));
			return;
		}

		return $a.promise(this.$nextTick(), cbOrParams);
	}

	/**
	 * Forces the component rerender
	 */
	@wait({defer: true, label: $$.forceUpdate})
	forceUpdate(): Promise<void> {
		this.renderCounter++;
		return Promise.resolve();
	}

	/**
	 * Loads component data
	 *
	 * @param [data] - data object (for events)
	 * @param [params] - additional parameters:
	 *   *) [silent] - silent mode
	 *   *) [recursive] - recursive loading of all remote providers
	 *
	 * @emits initLoad(data: CanUndef<unknown>, params: CanUndef<InitLoadParams>)
	 * @emits dbReady(data: CanUndef<unknown>, params: CanUndef<InitLoadParams>)
	 */
	@hook('beforeDataCreate')
	initLoad(
		data?: unknown | ((this: this) => unknown),
		params: InitLoadParams = {}
	): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;

		if (!params.silent) {
			this.componentStatus = 'loading';
		}

		const
			{$children: $c, async: $a} = this,
			providers = new Set<iBlock>();

		if ($c) {
			for (let i = 0; i < $c.length; i++) {
				const
					el = $c[i],
					st = <string>el.componentStatus;

				if (el.remoteProvider && statuses[st]) {
					if (st === 'ready') {
						if (params.recursive) {
							el.reload({silent: params.silent === true, ...params}).catch(stderr);

						} else {
							continue;
						}
					}

					providers.add(el);
				}
			}
		}

		const done = () => {
			const
				get = () => Object.isFunction(data) ? data.call(this) : data;

			this.lfc.execCbAtTheRightTime(() => this.emit('dbReady', get(), params));
			this.componentStatus = 'beforeReady';

			this.lfc.execCbAfterBlockReady(() => {
				this.isInitializedOnce = true;
				this.componentStatus = 'ready';

				if (this.beforeReadyListeners > 1) {
					this.nextTick().then(() => {
						this.beforeReadyListeners = 0;
						this.emit('initLoad', get(), params);
					});

				} else {
					this.emit('initLoad', get(), params);
				}
			});
		};

		if (this.globalName || providers.size) {
			const init = async () => {
				await this.state.initFromStorage();

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

			return $a.promise(init, {join: 'replace', label: $$.initLoad}).catch(stderr);
		}

		done();
	}

	/**
	 * Reloads component data
	 *
	 * @param [params] - additional parameters:
	 *   *) [silent] - silent mode
	 *   *) [recursive] - recursive loading of all remote providers
	 */
	reload(params?: InitLoadParams): Promise<void> {
		const
			res = this.initLoad(undefined, {silent: true, ...params});

		if (Object.isPromise(res)) {
			return res;
		}

		return Promise.resolve();
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

	@p({replace: false})
	setMod(nodeOrName: Element | string, name: string | unknown, value?: unknown): CanPromise<boolean | void> {
		if (Object.isString(nodeOrName)) {
			if (this.isFlyweight || this.isFunctional) {
				const res = Block.prototype.setMod.call(
					this.dom.createBlockCtxFromNode(this.$el, this),
					nodeOrName,
					name
				);

				if (res) {
					this.mods[nodeOrName] = String(name);
				}

				return res;
			}

			return this.lfc.execCbAfterBlockReady(() => this.block.setMod(nodeOrName, name)) || false;
		}

		return Block.prototype.setMod.call(
			this.dom.createBlockCtxFromNode(nodeOrName),
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

	@p({replace: false})
	removeMod(nodeOrName: Element | string, name?: string | unknown, value?: unknown): CanPromise<boolean | void> {
		if (Object.isString(nodeOrName)) {
			if (this.isFlyweight || this.isFunctional) {
				const res = Block.prototype.removeMod.call(
					this.dom.createBlockCtxFromNode(this.$el, this),
					nodeOrName,
					name
				);

				if (res) {
					delete this.mods[nodeOrName];
				}

				return res;
			}

			return this.lfc.execCbAfterBlockReady(() => this.block.removeMod(nodeOrName, name)) || false;
		}

		return Block.prototype.removeMod.call(
			this.dom.createBlockCtxFromNode(nodeOrName),
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
	@p({replace: false})
	setRootMod(name: string, value: unknown): boolean {
		return this.$root.setRootMod(name, value, this);
	}

	/**
	 * Removes a modifier from the root element
	 *
	 * @param name
	 * @param value
	 */
	@p({replace: false})
	removeRootMod(name: string, value?: unknown): boolean {
		return this.$root.removeRootMod(name, value, this);
	}

	/**
	 * Returns a value of the specified root element modifier
	 * @param name
	 */
	@p({replace: false})
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
	@p({replace: false})
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
	 * Internal $watch wrapper
	 *
	 * @param exprOrFn
	 * @param opts
	 */
	@p({replace: false})
	protected $$watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T> & {fieldInfo?: FieldInfo}
	): Function {
		const
			{handler} = opts;

		let
			oldVal,
			watchCache,
			needCache;

		if (Object.isString(exprOrFn)) {
			const
				info = opts.fieldInfo || getFieldInfo(exprOrFn, this),
				val = this.field.get(exprOrFn);

			if (info && info.type === 'prop' && (
				// @ts-ignore (access)
				info.ctx.meta.params.root ||
				!(info.name in (info.ctx.$options.propsData || {}))
			)) {
				if (opts.immediate) {
					handler.call(this, val);
				}

				return () => undefined;
			}

			exprOrFn = info.fullPath;
			needCache = handler.length > 1;

			if (needCache) {
				// @ts-ignore (access)
				watchCache = info.ctx.watchCache;

				oldVal = watchCache[exprOrFn] = exprOrFn in watchCache ?
					watchCache[exprOrFn] : cloneWatchValue(val);
			}
		}

		return this.$watch(exprOrFn, {
			handler(val: unknown, defOldVal: unknown): unknown {
				if (!needCache || val !== defOldVal) {
					if (needCache) {
						oldVal = defOldVal;
					}

					return handler.call(this, val, defOldVal);
				}

				const res = handler.call(this, val, oldVal);
				oldVal = watchCache[<string>exprOrFn] = cloneWatchValue(val);
				return res;
			},

			deep: opts.deep,
			immediate: opts.immediate
		});
	}

	/**
	 * Returns an object with default component fields for saving to a local storage
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns an object with default component fields for resetting a local storage
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.syncStorageState(data),
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
	protected syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns an object with default component fields for resetting a router
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.syncRouterState(data),
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
	protected isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T} | Function): obj is T {
		return Boolean(obj && (<Dictionary>obj).instance instanceof (constructor || iBlock));
	}

	/**
	 * Waits until the specified reference won't be available and returns it
	 *
	 * @see Async.wait
	 * @param ref
	 * @param [params] - async parameters
	 */
	protected waitRef<T = iBlock | Element | iBlock[] | Element[]>(ref: string, params?: AsyncOptions): Promise<T> {
		let
			that = <iBlock>this;

		if (this.isFlyweight || this.isFunctional) {
			ref += `:${this.componentId}`;
			that = this.$normalParent || that;
		}

		const
			watchers = that.$$refs[ref] = that.$$refs[ref] || [],
			refVal = that.$refs[ref];

		return this.async.promise(() => new Promise((resolve) => {
			if (refVal) {
				resolve(<T>refVal);

			} else {
				watchers.push(resolve);
			}
		}), params);
	}

	/**
	 * Initializes core component API
	 */
	@hook({beforeRuntime: {functional: false}})
	protected initBaseAPI(): void {
		const
			i = this.instance;

		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);

		this.watch = i.watch.bind(this);
		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.off = i.off.bind(this);
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

		for (let i = 0; i < this.blockReadyListeners.length; i++) {
			this.blockReadyListeners[i]();
		}

		this.blockReadyListeners = [];
	}

	/**
	 * Initializes global event listeners
	 * @param [resetListener]
	 */
	@hook({created: {functional: false}})
	protected initGlobalEvents(resetListener?: boolean): void {
		initGlobalEvents(this, resetListener);
	}

	/**
	 * Initializes modifiers event listeners
	 */
	@hook('beforeCreate')
	protected initModEvents(): void {
		return undefined;
	}

	/**
	 * Initializes watchers from .watchProp
	 */
	@hook({beforeDataCreate: {functional: false}})
	protected initRemoteWatchers(): void {
		initRemoteWatchers(this);
	}

	/**
	 * Initializes callChild event listener
	 */
	@watch({field: 'proxyCall', immediate: true})
	protected initCallChildListener(value: boolean): void {
		if (!value) {
			return;
		}

		this.parentEvent.on('onCallChild', this.onCallChild);
	}

	/**
	 * Handler: parent call child event
	 * @param e
	 */
	protected onCallChild(e: ParentMessage): void {
		if (
			e.check[0] !== 'instanceOf' && e.check[1] === this[e.check[0]] ||
			e.check[0] === 'instanceOf' && this.instance instanceof <Function>e.check[1]
		) {
			return e.action.call(this);
		}
	}

	/**
	 * Component activated hook
	 * (for keep-alive)
	 *
	 * @param [force]
	 */
	protected activated(force?: boolean): void {
		onActivated(this, force);
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
	@p({replace: false})
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
	public readonly browser!: typeof browser;
	public readonly t!: typeof i18n;

	public readonly meta!: ComponentMeta;
	public readonly $attrs!: Dictionary<string>;

	public readonly async!: Async<this>;
	public readonly block!: Block;
	public readonly dom!: DOM;

	public readonly localEvent!: Event<this>;
	public readonly globalEvent!: Event<this>;
	public readonly rootEvent!: Event<this>;
}

function defaultI18n(): string {
	return (this.$root.i18n || ((i18n))).apply(this.$root, arguments);
}
