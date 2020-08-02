/* eslint-disable max-lines */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools';

import SyncPromise from 'core/promise/sync';
import Async, { AsyncOptions, ClearOptionsId, ProxyCb, BoundFn } from 'core/async';
import log, { LogMessageOptions } from 'core/log';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

//#if runtime has core/helpers
import * as helpers from 'core/helpers';
//#endif

//#if runtime has core/browser
import * as browser from 'core/browser';
//#endif

import * as presets from 'presets';

//#if runtime has bRouter
import bRouter from 'base/b-router/b-router';
//#endif

//#if runtime has iStaticPage
import iStaticPage from 'super/i-static-page/i-static-page';
//#endif

import {

	component,
	PARENT,

	globalEmitter,
	customWatcherRgxp,
	bindRemoteWatchers,

	WatchPath,
	RawWatchHandler,
	ComponentInterface,
	UnsafeGetter,

	VNode

} from 'core/component';

import 'super/i-block/directives';
import { statuses } from 'super/i-block/const';

import Cache from 'super/i-block/modules/cache';
import Opt from 'super/i-block/modules/opt';
import Lazy from 'super/i-block/modules/lazy';

import Daemons, { DaemonsDict } from 'super/i-block/modules/daemons';
import Analytics from 'super/i-block/modules/analytics';

import DOM from 'super/i-block/modules/dom';
import VDOM from 'super/i-block/modules/vdom';

import Lfc from 'super/i-block/modules/lfc';
import AsyncRender from 'super/i-block/modules/async-render';
import Sync, { AsyncWatchOptions } from 'super/i-block/modules/sync';

import Block from 'super/i-block/modules/block';
import Field from 'super/i-block/modules/field';

import Provide, { classesCache, Classes, Styles } from 'super/i-block/modules/provide';
import State, { ConverterCallType } from 'super/i-block/modules/state';
import Storage from 'super/i-block/modules/storage';

import {

	wrapEventEmitter,
	EventEmitterWrapper,
	ReadonlyEventEmitterWrapper

} from 'super/i-block/modules/event-emitter';

import { initGlobalListeners, initRemoteWatchers } from 'super/i-block/modules/listeners';
import { readyStatuses, activate, deactivate, onActivated, onDeactivated } from 'super/i-block/modules/activation';

import {

	Stage,
	ComponentStatus,

	ComponentStatuses,
	ComponentEvent,

	InitLoadOptions,
	InitLoadCb,

	ParentMessage,
	UnsafeIBlock

} from 'super/i-block/interface';

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

	p,

	prop,
	field,
	system,
	computed,

	watch,
	hook,
	wait,

	WaitDecoratorOptions,
	DecoratorMethodWatcher

} from 'super/i-block/modules/decorators';

export * from 'core/component';
export * from 'super/i-block/const';
export * from 'super/i-block/interface';

export * from 'super/i-block/modules/block';
export * from 'super/i-block/modules/field';
export * from 'super/i-block/modules/state';

export * from 'super/i-block/modules/daemons';
export * from 'super/i-block/modules/event-emitter';

export * from 'super/i-block/modules/sync';
export * from 'super/i-block/modules/async-render';
export * from 'super/i-block/modules/decorators';

export { default as Friend } from 'super/i-block/modules/friend';

export {

	Cache,
	Classes,

	ModVal,
	ModsDecl,
	ModsTable,
	ModsNTable

};

export const
	$$ = symbolGenerator();

/**
 * Superclass for all components
 */
@component()
export default abstract class iBlock extends ComponentInterface {
	/** @override */
	readonly Component!: iBlock;

	/** @override */
	readonly Root!: iStaticPage;

	/** @override */
	// @ts-ignore (override)
	readonly $root!: this['Root'];

	/**
	 * Component unique identifier
	 */
	@system({
		atom: true,
		unique: (ctx, oldCtx) => !ctx.$el?.classList.contains(oldCtx.componentId),
		init: () => `uid-${Math.random().toString().slice(2)}`
	})

	readonly componentId!: string;

	/**
	 * Component unique name.
	 * It's used to enable synchronization of component data with different storages: local, router, etc.
	 */
	@prop({type: String, required: false})
	readonly globalName?: string;

	/**
	 * Component render cache key.
	 * It's used to cache the component vnode.
	 */
	@prop({required: false})
	readonly renderKey?: string;

	/**
	 * Initial component stage value.
	 *
	 * The stage property can be used to mark different states of the component.
	 * For example, we have a component implements a form of image uploading,
	 * and we have two variants of the form: upload by a link or upload from a computer.
	 *
	 * We can create two stage values: 'link' and 'file' to separate the component template by two variant of a markup
	 * depending on the stage value.
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

	/**
	 * Component stage value
	 * @see [[iBlock.stageProp]]
	 */
	@computed({replace: false})
	get stage(): CanUndef<Stage> {
		return this.field.get('stageStore');
	}

	/**
	 * Sets a new component stage value.
	 * Also, by default, clears all async listeners from the group of `stage.${oldGroup}`.
	 *
	 * @see [[iBlock.stageProp]]
	 * @emits `stage:${value}(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 * @emits `stageChange(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 */
	set stage(value: CanUndef<Stage>) {
		const
			oldValue = this.stage;

		if (oldValue === value) {
			return;
		}

		this.async.clearAll({group: this.stageGroup});
		this.field.set('stageStore', value);

		if (value != null) {
			this.emit(`stage:${value}`, value, oldValue);
		}

		this.emit('stageChange', value, oldValue);
	}

	/**
	 * Group name of the current stage
	 */
	@computed({replace: false})
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * Initial component modifiers.
	 * Modifiers represent the special API to bind component state properties directly with CSS classes
	 * without needless of component re-rendering.
	 */
	@prop({type: Object, required: false})
	readonly modsProp?: ModsTable;

	/**
	 * Component modifiers
	 * @see [[iBlock.modsProp]]
	 */
	@system({
		replace: false,
		merge: mergeMods,
		init: initMods
	})

	readonly mods!: ModsNTable;

	/**
	 * If true, then the component won't be destroyed after removal from the DOM
	 * (only for functional components)
	 */
	@prop(Boolean)
	readonly keepAlive: boolean = false;

	/**
	 * If true, then the component is activated.
	 * The deactivated component won't load data from providers on initializing.
	 */
	@prop(Boolean)
	readonly activatedProp: boolean = true;

	/**
	 * If true, then is enabled forcing of activation handlers (only for functional components).
	 * By default, functional components don't execute activation handlers: router/storage synchronization, etc.
	 */
	@prop(Boolean)
	readonly forceActivation: boolean = false;

	/**
	 * If true, then the component will try to reload data on re-activation.
	 * This parameter can be useful if you are using keep-alive directive within your template.
	 * For example, you have a page within keep-alive, and after backing to this page the component will be forcely drawn
	 * from a keep-alive cache, but after this page will try to update data in silent.
	 */
	@prop(Boolean)
	readonly reloadOnActivation: boolean = false;

	/**
	 * If true, then the component is marked as a remote provider.
	 * It means, that a parent component will wait the loading of the current component.
	 */
	@prop(Boolean)
	readonly remoteProvider: boolean = false;

	/**
	 * If true, then the component will listen the special event of its parent.
	 * It's used to provide a common functionality of proxy calls from the parent.
	 */
	@prop(Boolean)
	readonly proxyCall: boolean = false;

	/**
	 * If true, then the component state will be synchronized with the router after initializing.
	 * For example, you have a component uses "syncRouterState" method to create two-way binding with the router.
	 *
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @field()
	 *   stage: string = 'defaultStage';
	 *
	 *   syncRouterState(data?: Dictionary) {
	 *     // This notation means that if there is a value within "route.query"
	 *     // it will be mapped to the component as "stage" field.
	 *     // If a route was changed, the mapping repeat.
	 *     // Also if "stage" field of the component was changed,
	 *     // it will be mapped to the router as "stage" query parameter by using "router.push".
	 *     return {stage: data?.stage || this.stage};
	 *   }
	 * }
	 * ```
	 *
	 * But, if in some cases we don't have "stage" within "route.query", and the component have the default value,
	 * we trap in a situation where exists route, which wasn't synchronized with the component, and
	 * it can affect to the "back" logic. Sometimes, this behavior doesn't match our expectations.
	 * But if we toggle "syncRouterStoreOnInit" to true, the component will forcibly map own state to
	 * the router after initializing.
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

	/**
	 * Map of remote component watchers.
	 * The usage of this mechanism is similar to the "@watch" decorator:
	 *   *) As a key we declare a name of a component method that we want to call;
	 *   *) As a value we declare a path to a property/event we want to watch/listen.
	 *      Also, the method can take additional parameters of watching.
	 *      Mind, the properties/events is taken from a component contents the current.
	 *
	 * @see [[iBlock.watch]]
	 * @example
	 * ```js
	 * // We have two components: A and B.
	 * // We want to declare that the component B must calls own "reload" method on an event from the component A.
	 *
	 * {
	 *   // If we want to listen events, we should use the ":" syntax.
	 *   // Also, we can provide a different event emitter as "link:",
	 *   // for instance, "document:scroll"
	 *   reload: ':foo'
	 * }
	 * ```
	 *
	 * @example
	 * ```js
	 * // We can attach multiple watchers for one method
	 *
	 * {
	 *   reload: [
	 *     // Listens "foo" events from A
	 *     ':foo',
	 *
	 *     // Watches for changes of the "A.bla" property
	 *     'bla',
	 *
	 *     // Listens window.document scroll event,
	 *     // doesn't provide event arguments to "reload"
	 *     {
	 *       path: 'document:scroll',
	 *       provideArgs: false
	 *     }
	 *   ]
	 * }
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly watchProp?: Dictionary<DecoratorMethodWatcher>;

	/**
	 * If true, then is enabled a dispatching mode of component events.
	 *
	 * It means that all component events will bubble to a parent component:
	 * if the parent also has this property in true, then the events will bubble to the next (from the hierarchy)
	 * parent component.
	 *
	 * All dispatching events have special prefixes to avoid collisions with events from another components,
	 * for example: bButton "click" will bubble as "b-button::click".
	 * Or if the component has globalName parameter, it will additionally bubble as `${globalName}::click`.
	 */
	@prop(Boolean)
	readonly dispatching: boolean = false;

	/**
	 * If true, then all events that are bubbled from child components
	 * will be emitted as component self events without any prefixes
	 */
	@prop(Boolean)
	readonly selfDispatching: boolean = false;

	/**
	 * Additional component parameters.
	 * This parameter can be useful if you need to provide some unstructured additional parameters to a component.
	 */
	@prop({type: Object, required: false})
	readonly p?: Dictionary;

	/**
	 * Additional classes for component elements.
	 * It can be useful, if you need to attach some extra classes to internal component elements.
	 * Be sure you know what are you doing, because this mechanism is tied on a component internal markup.
	 *
	 * @example
	 * // Key names are tied with component elements,
	 * // and values contain a CSS class or list of classes we want to add
	 *
	 * {
	 *   foo: 'bla',
	 *   bar: ['bla', 'baz']
	 * }
	 */
	@prop({type: Object, required: false})
	readonly classes?: Dictionary<CanArray<string>>;

	/**
	 * Additional styles for component elements.
	 * It can be useful, if you need to attach some extra styles to internal component elements.
	 * Be sure you know what are you doing, because this mechanism is tied on a component internal markup.
	 *
	 * @example
	 * // Key names are tied with component elements,
	 * // and values contains a CSS style string, a style object or list of style strings
	 *
	 * {
	 *   foo: 'color: red',
	 *   bar: {color: 'blue'},
	 *   baz: ['color: red', 'background: green']
	 * }
	 */
	@prop({type: Object, required: false})
	readonly styles?: Styles;

	/**
	 * Link to i18n function, that will be used to localize of string literals
	 */
	@prop(Function)
	readonly i18n: typeof i18n = defaultI18n;

	/**
	 * Link to a remote state object.
	 *
	 * The remote state object is a special watchable object that provides some parameters
	 * that can't be initialized within a component directly. You can modify this object outside from components,
	 * but remember, that these mutations may force re-render of all components.
	 */
	@computed({watchable: true, dependencies: ['r.remoteState']})
	get remoteState(): this['r']['remoteState'] {
		return this.r.remoteState;
	}

	/**
	 * Component status.
	 * This parameter is pretty similar to "hook" parameter.
	 * But, the hook represents a component status relative to its MVVM instance: created, mounted, destroyed, etc.
	 * Opposite to "hook", "componentStatus" represents a logical component status:
	 *
	 *   *) unloaded - a component was just created without any initializing:
	 *      this status can intersect with some hooks, like beforeCreate or created
	 *
	 *   *) loading - a component starts to load data from own providers:
	 *      this status can intersect with some hooks, like created or mounted.
	 *      If the component was mounted with this status, you can show by using UI that data is loading.
	 *
	 *   *) beforeReady - a component was fully loaded and starts to prepare to render:
	 *      this status can intersect with some hooks like created or mounted
	 *
	 *   *) ready - a component was fully loaded and rendered:
	 *      this status can intersect with "mounted" hook
	 *
	 *   *) inactive - a component is frozen by keep-alive mechanism or special input property:
	 *      this status can intersect with "deactivated" hook
	 *
	 *   *) destroyed - a component was destroyed:
	 *      this status can intersect with some hooks, like beforeDestroy or destroyed
	 */
	@computed({replace: false})
	get componentStatus(): ComponentStatus {
		if (this.isFlyweight) {
			return 'ready';
		}

		return this.shadowComponentStatusStore ?? this.field.get<ComponentStatus>('componentStatusStore')!;
	}

	/**
	 * Sets a new component status.
	 * Notice, not all statuses emit re-render of the component: unloaded, inactive, destroyed will emit only an event.
	 *
	 * @param value
	 * @emits `componentStatus:{$value}(value: Statuses, oldValue: Statuses)`
	 * @emits `componentStatusChange(value: Statuses, oldValue: Statuses)`
	 */
	set componentStatus(value: ComponentStatus) {
		const
			oldValue = this.componentStatus;

		if (oldValue === value && value !== 'beforeReady') {
			return;
		}

		const
			isShadowStatus = (<typeof iBlock>this.instance.constructor).shadowComponentStatuses[value];

		if (isShadowStatus || value === 'ready' && oldValue === 'beforeReady') {
			this.shadowComponentStatusStore = value;

		} else {
			this.shadowComponentStatusStore = undefined;
			this.field.set('componentStatusStore', value);
		}

		if (!this.isFlyweight) {
			void this.setMod('status', value);

			// @deprecated
			this.emit(`status-${value}`, value);
			this.emit(`componentStatus:${value}`, value, oldValue);
			this.emit('componentStatusChange', value, oldValue);
		}
	}

	/**
	 * True if the component is already activated
	 * @see [[iBlock.activatedProp]]
	 */
	@system((o) => {
		void o.lfc.execCbAtTheRightTime(() => {
			if (o.isFunctional && !o.field.get<boolean>('forceActivation')) {
				return;
			}

			if (o.field.get<boolean>('isActivated')) {
				o.activate(true);

			} else {
				o.deactivate();
			}
		});

		return o.sync.link('activatedProp', (val: boolean) => {
			if (o.hook !== 'beforeDataCreate') {
				o[val ? 'activate' : 'deactivate']();
			}

			return val;
		});
	})

	isActivated!: boolean;

	/**
	 * True if the component was in ready status at least once
	 */
	@system()
	isReadyOnce: boolean = false;

	/**
	 * Link to the component root
	 */
	get r(): this['$root'] {
		return this.$root;
	}

	/**
	 * Link to an application router
	 */
	get router(): CanUndef<bRouter> {
		return this.field.get('routerStore', this.r);
	}

	/**
	 * Link to an application route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	/**
	 * True if the current component is ready
	 * (componentStatus == ready)
	 */
	@computed({replace: false})
	get isReady(): boolean {
		return Boolean(readyStatuses[this.componentStatus]);
	}

	/**
	 * True if the current component is functional
	 */
	@computed({replace: false})
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * Base component modifiers.
	 * These modifiers are automatically provided to child components.
	 * For example, you have a component uses another component within own template,
	 * and you specify to the outer component some theme modifier.
	 * This modifier will recursively provide to all child components.
	 */
	@computed({replace: false})
	get baseMods(): CanUndef<Readonly<ModsNTable>> {
		const
			m = this.mods;

		let
			res;

		if (m.theme != null) {
			res = {theme: m.theme};
		}

		return res != null ? Object.freeze(res) : undefined;
	}

	/**
	 * API for analytic engines
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Analytics(ctx)
	})

	readonly analytics!: Analytics;

	/**
	 * API for component value providers.
	 * This property gives a bunch of methods to provide component classes/styles to another component, etc.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Provide(ctx)
	})

	readonly provide!: Provide;

	/**
	 * API for the component life cycle
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Lfc(ctx)
	})

	readonly lfc!: Lfc;

	/**
	 * API for component field accessors.
	 * This property provides a bunch of methods to safety access to a component property.
	 *
	 * @example
	 * ```js
	 * this.field.get('foo.bar.bla')
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Field(ctx)
	})

	readonly field!: Field;

	/**
	 * API to synchronize component properties.
	 * This property provides a bunch of method to organize a "link" from one component property to another.
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @prop()
	 *   blaProp: string;
	 *
	 *   @field((ctx) => ctx.sync.link('blaProp'))
	 *   bla: string;
	 * }
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Sync(ctx)
	})

	readonly sync!: Sync;

	/**
	 * API to render component template chunks asynchronously
	 *
	 * @example
	 * ```
	 * < .bla v-for = el in asyncRender.iterate(veryBigList, 10)
	 *   {{ el }}
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		functional: false,
		init: (ctx) => new AsyncRender(ctx)
	})

	readonly asyncRender!: AsyncRender;

	/**
	 * API to work with a VDOM tree
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new VDOM(ctx)
	})

	readonly vdom!: VDOM;

	/**
	 * API to unsafe invoke of internal properties of the component.
	 * It can be useful to create friendly classes for a component.
	 */
	@p({replace: true})
	get unsafe(): UnsafeGetter<UnsafeIBlock<this>> {
		return <any>this;
	}

	/**
	 * The special link to a parent component.
	 * This parameter is used with static declaration of modifiers to refer parent modifiers.
	 *
	 * @example
	 * ```js
	 * @component()
	 * class Foo extends iBlock {
	 *   static mods = {
	 *     theme: [
	 *       ['light']
	 *     ]
	 *   };
	 * }
	 *
	 * @component()
	 * class Bar extends Foo {
	 *   static mods = {
	 *     theme: [
	 *       Bar.PARENT,
	 *       ['dark']
	 *     ]
	 *   };
	 * }
	 * ```
	 */
	static readonly PARENT: object = PARENT;

	/**
	 * Map of component shadow statuses.
	 * These statuses don't emit re-render of a component.
	 *
	 * @see [[iBlock.componentStatus]]
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
		inactive: true,
		destroyed: true,
		unloaded: true
	};

	/**
	 * Static declaration of component modifiers.
	 * This declaration helps to declare the default value of a modifier: just wrap the value with square brackets.
	 * Also, all modifiers that are declared can be provided to a component not only by using "modsProp", but as an own
	 * prop value. In addition to previous benefits, if you provide all available values of modifiers to the declaration,
	 * it can be useful for runtime reflection.
	 *
	 * @example
	 * ```js
	 * @component()
	 * class Foo extends iBlock {
	 *   static mods = {
	 *     theme: [
	 *       'dark',
	 *       ['light']
	 *     ]
	 *   };
	 * }
	 * ```
	 *
	 * ```
	 * < foo :theme = 'dark'
	 * ```
	 *
	 * @see [[iBlock.modsProp]]
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
	 * Map of static component daemons.
	 * Daemon is a special object that can watch component properties,
	 * listen component events/hooks and do some useful payload, like sending analytic or performance events.
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * API for daemons
	 */
	@system({
		unique: true,
		replace: true,
		init: (ctx) => new Daemons(ctx)
	})

	protected readonly daemons!: Daemons;

	/**
	 * API for the component local storage
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx) => new Storage(ctx)
	})

	protected readonly storage!: Storage;

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
	 * API for the component state.
	 * This property provides a bunch of helper methods to initialize component state.
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx) => new State(ctx)
	})

	protected readonly state!: State;

	/**
	 * API to work with a DOM tree
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new DOM(ctx)
	})

	protected readonly dom!: DOM;

	/**
	 * API for BEM like develop.
	 * This property provides a bunch of methods to get/set/remove modifiers of the component.
	 */
	@system({unique: true})
	protected block?: Block;

	/**
	 * API for lazy operations.
	 * This property provides a bunch of helper methods to organize lazy calculations.
	 * @deprecated
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: (ctx) => new Lazy(ctx)
	})

	protected readonly lazy!: Lazy;

	/**
	 * API for optimization.
	 * This property provides a bunch of helper methods to optimize some operations.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Opt(ctx)
	})

	protected readonly opt!: Opt;

	/** @override */
	@system()
	protected renderCounter: number = 0;

	/**
	 * Component stage store
	 * @see [[iBlock.stageProp]]
	 */
	@field({
		replace: false,
		forceUpdate: false,
		init: (o) => o.sync.link<CanUndef<Stage>>((val) => {
			o.stage = val;
			return o.field.get('stageStore');
		})
	})

	protected stageStore?: Stage;

	/**
	 * Component initialize status store
	 * @see [[iBlock.componentStatus]]
	 */
	@field({unique: true, forceUpdate: false})
	protected componentStatusStore: ComponentStatus = 'unloaded';

	/**
	 * Component initialize status store for unwatchable statuses
	 * @see [[iBlock.componentStatus]]
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: ComponentStatus;

	/**
	 * Store of component modifiers that can emit re-render of the component
	 */
	@field({
		merge: true,
		replace: false,
		forceUpdate: false,
		init: () => Object.create({})
	})

	protected watchModsStore!: ModsNTable;

	/**
	 * Special getter for component modifiers:
	 * on a first touch of a property from that object will be registered a modifier by the property name
	 * that can emit re-render of the component.
	 * Don't use this getter outside the component template.
	 */
	@computed({cache: true, replace: false})
	protected get m(): Readonly<ModsNTable> {
		return getWatchableMods(this);
	}

	/**
	 * Cache object for opt.ifOnce
	 */
	@system({merge: true, replace: false})
	protected readonly ifOnceStore: Dictionary<number> = {};

	/**
	 * The temporary cache.
	 * Mutation of this object don't emit re-render of the component.
	 */
	@system({
		merge: true,
		replace: false,
		init: () => Object.createDict()
	})

	protected tmp!: Dictionary;

	/**
	 * The temporary cache.
	 * Mutation of this object emit re-render of the component.
	 */
	@field({merge: true})
	protected watchTmp: Dictionary = {};

	/**
	 * The render temporary cache.
	 * It's used with the "renderKey" directive.
	 */
	@system({
		merge: true,
		replace: false,
		init: () => Object.createDict()
	})

	protected renderTmp!: Dictionary<VNode>;

	/**
	 * Cache of watched values
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
	@computed({replace: false})
	protected get self(): this {
		return this;
	}

	/**
	 * Self event emitter
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		replace: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, o)
	})

	protected readonly selfEmitter!: EventEmitterWrapper<this>;

	/**
	 * Local event emitter: all events that are fired from this emitter don't bubble
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, new EventEmitter({
			maxListeners: 1e3,
			newListener: false,
			wildcard: true
		}), {suspend: true})
	})

	protected readonly localEmitter!: EventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iBlock.localEmitter]]
	 */
	@deprecated({renamedTo: 'localEmitter'})
	get localEvent(): EventEmitterWrapper<this> {
		return this.localEmitter;
	}

	/**
	 * Event emitter of the parent component
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, () => o.$parent, true)
	})

	protected readonly parentEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iBlock.parentEmitter]]
	 */
	@deprecated({renamedTo: 'parentEmitter'})
	get parentEvent(): ReadonlyEventEmitterWrapper<this> {
		return this.parentEmitter;
	}

	/**
	 * Event emitter of the root component
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		replace: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, o.r)
	})

	protected readonly rootEmitter!: EventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iBlock.rootEmitter]]
	 */
	@deprecated({renamedTo: 'rootEmitter'})
	get rootEvent(): ReadonlyEventEmitterWrapper<this> {
		return this.rootEmitter;
	}

	/**
	 * Global event emitter of an application.
	 * It can be used to provide external events to a component.
	 */
	@system({
		atom: true,
		after: 'async',
		unique: true,
		replace: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, globalEmitter)
	})

	protected readonly globalEmitter!: EventEmitterWrapper<this>;

	/**
	 * @deprecated
	 * @see [[iBlock.globalEmitter]]
	 */
	@deprecated({renamedTo: 'globalEmitter'})
	get globalEvent(): ReadonlyEventEmitterWrapper<this> {
		return this.globalEmitter;
	}

	/**
	 * Map of extra helpers.
	 * It can be useful to provide some helper functions to a component.
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
			// eslint-disable-next-line no-unreachable
			return {};
			//#endunless
		}
	})

	protected readonly h!: typeof helpers;

	/**
	 * API to check a browser
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
			// eslint-disable-next-line no-unreachable
			return {};
			//#endunless
		}
	})

	protected readonly browser!: typeof browser;

	/**
	 * Map of component presets
	 */
	@system({
		atom: true,
		unique: true,
		replace: true,
		init: () => presets
	})

	protected readonly presets!: typeof presets;

	/** @see [[iBlock.presets]] */
	@deprecated({renamedTo: 'presets'})
	get preset(): typeof presets {
		return this.presets;
	}

	/**
	 * Number of beforeReady event listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * List of block ready listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected blockReadyListeners: Function[] = [];

	/**
	 * Alias for .i18n
	 */
	@computed({replace: false})
	protected get t(): this['i18n'] {
		return this.i18n;
	}

	/**
	 * Link to globalThis.l
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
	 * Sets a watcher to a component/object property or event by the specified path.
	 *
	 * When you watch for changes of some property, the handler function can take the second argument that refers
	 * to the old value of a property. If the object that watching is non-primitive, the old value will be cloned from the
	 * original old value to avoid the problem when we have two links to the one object.
	 *
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   list: Dictionary[] = [];
	 *
	 *   @watch('list')
	 *   onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   // When you don't declare the second argument in a watcher,
	 *   // the previous value isn't cloned
	 *   @watch('list')
	 *   onListChangeWithoutCloning(value: Dictionary[]): void {
	 *     // true
	 *     console.log(value === arguments[1]);
	 *     console.log(value[0] === oldValue[0]);
	 *   }
	 *
	 *   // When you watch a property in a deep and declare the second argument
	 *   // in a watcher, the previous value is cloned deeply
	 *   @watch({path: 'list', deep: true})
	 *   onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   created() {
	 *     this.list.push({});
	 *     this.list[0].foo = 1;
	 *   }
	 * }
	 * ```
	 *
	 * To listen an event you need to use the special delimiter ":" within a path.
	 * Also, you can specify an event emitter to listen by writing a link before ":".
	 * For instance:
	 *
	 * 1. `':onChange'` - a component will listen own event "onChange";
	 * 2. `'localEmitter:onChange'` - a component will listen an event "onChange" from "localEmitter";
	 * 3. `'$parent.localEmitter:onChange'` - a component will listen an event "onChange" from "$parent.localEmitter";
	 * 4. `'document:scroll'` - a component will listen an event "scroll" from "window.document".
	 *
	 * A link to the event emitter is taken from component properties or from the global object.
	 * The empty link '' is a link to a component itself.
	 *
	 * Also, if you listen an event, you can manage when start to listen the event by using special characters at the
	 * beginning of a path string:
	 *
	 * 1. `'!'` - start to listen an event on the "beforeCreate" hook, for example: `'!rootEmitter:reset'`;
	 * 2. `'?'` - start to listen an event on the "mounted" hook, for example: `'?$el:click'`.
	 *
	 * By default, all events start to listen on the "created" hook.
	 *
	 * To listen for changes of another watchable object you need to specify the watch path as an object:
	 *
	 * ```
	 * {
	 *   ctx: linkToWatchObject,
	 *   path?: pathToWatch
	 * }
	 * ```
	 *
	 * @param path - path to a component property to watch or event to listen
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * // Watch for changes of "foo"
	 * this.watch('foo', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of another watchable object
	 * this.watch({ctx: anotherObject, path: 'foo'}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Deep watch for changes of "foo"
	 * this.watch('foo', {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of "foo.bla"
	 * this.watch('foo.bla', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen "onChange" event of a component
	 * this.watch(':onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen "onChange" event of a component parentEmitter
	 * this.watch('parentEmitter:onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		path: WatchPath,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to a component property/event by the specified path
	 *
	 * @param path - path to a component property to watch or event to listen
	 * @param handler
	 * @param [opts] - additional options
	 */
	watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		obj: object,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param handler
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		obj: object,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	@p({replace: false})
	watch<T = unknown>(
		path: WatchPath | object,
		optsOrHandler: AsyncWatchOptions | RawWatchHandler<this, T>,
		handlerOrOpts?: RawWatchHandler<this, T> | AsyncWatchOptions
	): void {
		if (this.isFlyweight) {
			return;
		}

		let
			handler,
			opts;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = handlerOrOpts;

		} else {
			handler = handlerOrOpts;
			opts = optsOrHandler;
		}

		opts = opts ?? {};

		if (Object.isString(path) && customWatcherRgxp.test(path)) {
			bindRemoteWatchers(this, {
				async: <Async<any>>this.async,
				watchers: {
					[path]: [
						{
							handler: (ctx, ...args: unknown[]) => handler.call(this, ...args),
							...opts
						}
					]
				}
			});

			return;
		}

		void this.lfc.execCbAfterComponentCreated(() => {
			const
				unwatch = this.$watch(<any>path, opts, handler);

			if (unwatch && (opts.group != null || opts.label != null || opts.join != null)) {
				this.async.worker(unwatch, {
					group: opts.group,
					label: opts.label,
					join: opts.join
				});
			}
		});
	}

	/**
	 * Emits a component event.
	 * Notice, this method always emits two events:
	 *
	 * 1) `${event}`(self, ...args)
	 * 2) `on-${event}`(...args)
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	emit(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			decl = Object.isString(event) ? {event} : event,
			eventNm = decl.event.dasherize();

		decl.event = eventNm;

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
	 * (all functions from arguments will be wrapped for logging)
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	emitError(event: string, ...args: unknown[]): void {
		this.emit({event, type: 'error'}, ...args);
	}

	/**
	 * Emits a component event to the parent component
	 *
	 * @param event
	 * @param args
	 */
	@p({replace: false})
	dispatch(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			decl = Object.isString(event) ? {event} : event,
			eventNm = decl.event.dasherize();

		decl.event = eventNm;

		let
			obj = this.$parent;

		const
			nm = this.componentName,
			globalNm = (this.globalName ?? '').dasherize(),
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

				if (globalNm !== '') {
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
	 * @see [[Async.on]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	@p({replace: false})
	on<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		event = event.dasherize();

		if (opts) {
			this.async.on(this, event, handler, opts);
			return;
		}

		this.$on(event, handler);
	}

	/**
	 * Attaches a single event listener to the specified component event
	 *
	 * @see [[Async.once]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	@p({replace: false})
	once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		event = event.dasherize();

		if (opts) {
			this.async.once(this, event, handler, opts);
			return;
		}

		this.$once(event, handler);
	}

	/**
	 * Returns a promise that is resolved after emitting the specified component event
	 *
	 * @see [[Async.promisifyOnce]]
	 * @param event
	 * @param [opts] - additional options
	 */
	@p({replace: false})
	promisifyOnce<T = unknown>(event: string, opts?: AsyncOptions): Promise<T> {
		return this.async.promisifyOnce(this, event.dasherize(), opts);
	}

	/**
	 * Detaches an event listeners from the component
	 *
	 * @param [event]
	 * @param [handler]
	 */
	off(event?: string, handler?: Function): void;

	/**
	 * Detaches an event listeners from the component
	 *
	 * @see [[Async.off]]
	 * @param [opts] - additional options
	 */
	off(opts: ClearOptionsId<object>): void;

	@p({replace: false})
	off(eventOrParams?: string | ClearOptionsId<object>, handler?: Function): void {
		const
			e = eventOrParams;

		if (e == null || Object.isString(e)) {
			this.$off(e?.dasherize(), handler);
			return;
		}

		this.async.off(e);
	}

	/**
	 * Returns a promise that will be resolved when the component is toggled to the specified status
	 *
	 * @see [[Async.promise]]
	 * @param status
	 * @param [opts] - additional options
	 */
	waitStatus(status: ComponentStatus, opts?: WaitDecoratorOptions): Promise<void>;

	/**
	 * Executes a callback when the component is toggled to the specified status.
	 * The method returns a promise with a result of invoking the function or raw result without wrapping
	 * if the component already in the specified status.
	 *
	 * @see [[Async.promise]]
	 * @param status
	 * @param cb
	 * @param [opts] - additional options
	 */
	waitStatus<F extends BoundFn<this>>(
		status: ComponentStatus,
		cb: F,
		opts?: WaitDecoratorOptions
	): CanPromise<ReturnType<F>>;

	@p({replace: false})
	waitStatus<F extends BoundFn<this>>(
		status: ComponentStatus,
		cbOrOpts?: F | WaitDecoratorOptions,
		opts?: WaitDecoratorOptions
	): CanPromise<undefined | ReturnType<F>> {
		let
			needWrap = true;

		let
			cb;

		if (Object.isFunction(cbOrOpts)) {
			cb = cbOrOpts;
			needWrap = false;

		} else {
			opts = cbOrOpts;
		}

		opts = {...opts, join: false};

		if (!needWrap) {
			return wait(status, {...opts, fn: cb}).call(this);
		}

		let
			isResolved = false;

		const promise = new SyncPromise((resolve) => wait(status, {
			...opts,
			fn: () => {
				isResolved = true;
				resolve();
			}
		}).call(this));

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (isResolved) {
			return promise;
		}

		return this.async.promise<undefined>(promise);
	}

	/**
	 * Executes the specified function on a next render tick
	 *
	 * @see [[Async.proxy]]
	 * @param fn
	 * @param [opts] - additional options
	 */
	nextTick(fn: BoundFn<this>, opts?: AsyncOptions): void;

	/**
	 * Returns a promise that will be resolved on a next render tick
	 *
	 * @see [[Async.promise]]
	 * @param [opts] - additional options
	 */
	nextTick(opts?: AsyncOptions): Promise<void>;
	nextTick(fnOrOpts?: BoundFn<this> | AsyncOptions, opts?: AsyncOptions): CanPromise<void> {
		const
			{async: $a} = this;

		if (Object.isFunction(fnOrOpts)) {
			this.$nextTick($a.proxy(fnOrOpts, opts));
			return;
		}

		return $a.promise(this.$nextTick(), fnOrOpts);
	}

	/**
	 * Forces the component re-render
	 */
	@wait({defer: true, label: $$.forceUpdate})
	forceUpdate(): Promise<void> {
		this.$forceUpdate();
		return Promise.resolve();
	}

	/**
	 * Loads initial data to the component
	 *
	 * @param [data] - data object (for events)
	 * @param [opts] - additional options
	 * @emits `initLoadStart(options: CanUndef<InitLoadOptions>)`
	 * @emits `initLoad(data: CanUndef<unknown>, options: CanUndef<InitLoadOptions>)`
	 */
	@hook('beforeDataCreate')
	initLoad(data?: unknown | InitLoadCb, opts: InitLoadOptions = {}): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;
		this.emit('initLoadStart', opts);

		if (!opts.silent) {
			this.componentStatus = 'loading';
		}

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const done = () => {
			const get = () => Object.isFunction(data) ? data.call(this) : data;
			this.componentStatus = 'beforeReady';

			void this.lfc.execCbAfterBlockReady(() => {
				this.isReadyOnce = true;
				this.componentStatus = 'ready';

				if (this.beforeReadyListeners > 1) {
					this.nextTick().then(() => {
						this.beforeReadyListeners = 0;
						this.emit('initLoad', get(), opts);
					}, stderr);

				} else {
					this.emit('initLoad', get(), opts);
				}
			});
		};

		if (this.globalName != null || !this.isFunctional) {
			if (this.isFunctional) {
				return $a.promise(async () => {
					await this.state.initFromStorage();
					done();
				}, label).catch(stderr);
			}

			const init = async () => {
				if (this.globalName != null) {
					await this.state.initFromStorage();

				} else {
					await this.nextTick(label);
				}

				const
					{$children: childComponent} = this;

				let
					remoteProviders: Nullable<Set<iBlock>> = null;

				if (childComponent) {
					for (let i = 0; i < childComponent.length; i++) {
						const
							el = childComponent[i],
							st = el.componentStatus;

						if (el.remoteProvider && Object.isTruly(statuses[st])) {
							if (st === 'ready') {
								if (opts.recursive) {
									el.reload({silent: opts.silent === true, ...opts}).catch(stderr);

								} else {
									continue;
								}
							}

							if (remoteProviders == null) {
								remoteProviders = new Set<iBlock>();
							}

							remoteProviders.add(el);
						}
					}
				}

				if (remoteProviders != null) {
					await $a.wait(() => {
						for (let o = remoteProviders!.values(), el = o.next(); !el.done; el = o.next()) {
							const
								val = el.value,
								st = val.componentStatus;

							if (st === 'ready' || statuses[st] <= 0) {
								remoteProviders!.delete(val);
								continue;
							}

							return false;
						}

						return true;
					});
				}

				done();
			};

			return $a.promise(init, label).catch(stderr);
		}

		done();
	}

	/**
	 * Reloads component data
	 * @param [opts] - additional options
	 */
	reload(opts?: InitLoadOptions): Promise<void> {
		const
			res = this.initLoad(undefined, {silent: true, ...opts});

		if (Object.isPromise(res)) {
			return res;
		}

		return Promise.resolve();
	}

	/**
	 * Sets a component modifier to the specified node
	 *
	 * @param node
	 * @param name - modifier name
	 * @param value - modifier value
	 */
	setMod(node: Element, name: string, value: unknown): CanPromise<boolean>;

	/**
	 * Sets a component modifier
	 *
	 * @param name - modifier name
	 * @param value - modifier value
	 */
	setMod(name: string, value: unknown): CanPromise<boolean>;

	@p({replace: false})
	setMod(nodeOrName: Element | string, name: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
			if (this.isFlyweight) {
				const ctx = this.dom.createBlockCtxFromNode(this.$el, this);
				return Block.prototype.setMod.call(ctx, nodeOrName, name);
			}

			const res = this.lfc.execCbAfterBlockReady(() => this.block!.setMod(nodeOrName, name));
			return res ?? false;
		}

		const ctx = this.dom.createBlockCtxFromNode(nodeOrName);
		return Block.prototype.setMod.call(ctx, name, value);
	}

	/**
	 * Removes a component modifier from the specified node
	 *
	 * @param node
	 * @param name - modifier name
	 * @param [value] - modifier value
	 */
	removeMod(node: Element, name: string, value?: unknown): CanPromise<boolean>;

	/**
	 * Removes a component modifier
	 *
	 * @param name - modifier name
	 * @param [value] - modifier value
	 */
	removeMod(name: string, value?: unknown): CanPromise<boolean>;

	@p({replace: false})
	removeMod(nodeOrName: Element | string, name?: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
			if (this.isFlyweight) {
				const ctx = this.dom.createBlockCtxFromNode(this.$el, this);
				return Block.prototype.removeMod.call(ctx, nodeOrName, name);
			}

			const res = this.lfc.execCbAfterBlockReady(() => this.block!.removeMod(nodeOrName, name));
			return res ?? false;
		}

		const ctx = this.dom.createBlockCtxFromNode(nodeOrName);
		return Block.prototype.removeMod.call(ctx, name, value);
	}

	/**
	 * Sets a modifier to the root element of an application.
	 * This method is useful, when you need to attach a class can affect to the whole application,
	 * for instance, you want to lock page scrolling, i.e. you need to add a class to the root HTML tag.
	 *
	 * @param name
	 * @param value
	 */
	@p({replace: false})
	setRootMod(name: string, value: unknown): boolean {
		return this.r.setRootMod(name, value, this);
	}

	/**
	 * Removes a modifier from the root element of an application
	 *
	 * @param name
	 * @param value
	 */
	@p({replace: false})
	removeRootMod(name: string, value?: unknown): boolean {
		return this.r.removeRootMod(name, value, this);
	}

	/**
	 * Returns a value of the specified root element modifier
	 * @param name
	 */
	@p({replace: false})
	getRootMod(name: string): CanUndef<string> {
		return this.r.getRootMod(name, this);
	}

	/**
	 * Activates the component.
	 * The deactivated component won't load data from providers on initializing.
	 *
	 * Basically, you don't need to think about a component activation,
	 * because it's automatically synchronized with keep-alive or the special input property.
	 *
	 * @see [[iBlock.activatedProp]]
	 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
	 */
	activate(force?: boolean): void {
		activate(this, force);
	}

	/**
	 * Deactivates the component.
	 * The deactivated component won't load data from providers on initializing.
	 *
	 * Basically, you don't need to think about a component activation,
	 * because it's automatically synchronized with keep-alive or the special input property.
	 *
	 * @see [[iBlock.activatedProp]]
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
	log(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void {
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

		if (this.globalName != null) {
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
	 * This method works as a two-way connector between a local storage and a component.
	 *
	 * When the component initializes, it asks the local storage for data that associated to this component
	 * by using a global name as a namespace to search. When the local storage is ready to provide data to the component,
	 * it passes data  to this method. After this, the method returns a dictionary that will be mapped to the
	 * component as properties (you can specify a complex path with dots, like 'foo.bla.bar' or 'mods.hidden').
	 *
	 * Also, the component will watch for changes of every property that was in that dictionary
	 * and when at least one of these properties is changed, the whole butch of data will be sent to the local storage
	 * by using this method. When the component provides local storage data the second argument of the method is
	 * equal to "remote".
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with default component properties to reset a local storage state
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.syncStorageState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * This method works as a two-way connector between the global router and a component.
	 *
	 * When the component initializes, it asks the router for data. The router provides the data by using this method.
	 * After this, the method returns a dictionary that will be mapped to the
	 * component as properties (you can specify a complex path with dots, like 'foo.bla.bar' or 'mods.hidden').
	 *
	 * Also, the component will watch for changes of every property that was in that dictionary
	 * and when at least one of these properties is changed, the whole butch of data will be sent to the router
	 * by using this method (the router will produce a new transition by using "push").
	 * When the component provides router data the second argument of the method is equal to "remote".
	 *
	 * Mind, that the router is global for all components, i.e. a dictionary that this method passes to the router
	 * will extend the current route data but not override (`router.push(null, {...route, ...componentData}})`).
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with default component properties to reset a router state
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary<undefined> {
		const
			stateFields = this.syncRouterState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
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
		return Object.isTruly(obj) && (<Dictionary>obj).instance instanceof (constructor ?? iBlock);
	}

	/**
	 * Waits until the specified reference won't be available and returns it.
	 * The method returns a promise.
	 *
	 * @see [[Async.wait]]
	 * @param ref - ref name
	 * @param [opts] - additional options
	 */
	protected waitRef<T = CanArray<iBlock | Element>>(ref: string, opts?: AsyncOptions): Promise<T> {
		let
			that = <iBlock>this;

		if (this.isFlyweight || this.isFunctional) {
			ref += `:${this.componentId}`;
			that = this.$normalParent ?? that;
		}

		that.$refHandlers[ref] = that.$refHandlers[ref] ?? [];

		const
			watchers = that.$refHandlers[ref],
			refVal = that.$refs[ref];

		return this.async.promise(() => new Promise((resolve) => {
			if (refVal != null) {
				resolve(<T>refVal);

			} else {
				watchers?.push(resolve);
			}
		}), opts);
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
	 * Initializes an instance of the Block class for the current component
	 */
	@hook('mounted')
	protected initBlockInstance(): void {
		if (this.block != null) {
			const
				{node} = this.block;

			if (node == null || node === this.$el) {
				return;
			}

			if (node.component === this) {
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
		initGlobalListeners(this, resetListener);
	}

	/**
	 * Initializes modifier event listeners
	 */
	@hook('beforeCreate')
	protected initModEvents(): void {
		return undefined;
	}

	/**
	 * Initializes remote watchers from the prop
	 */
	@hook({beforeDataCreate: {functional: false}})
	protected initRemoteWatchers(): void {
		initRemoteWatchers(this);
	}

	/**
	 * Initializes "callChild" event listener
	 */
	@watch({field: 'proxyCall', immediate: true})
	protected initCallChildListener(value: boolean): void {
		if (!value) {
			return;
		}

		this.parentEmitter.on('onCallChild', this.onCallChild.bind(this));
	}

	/**
	 * Handler: "callChild" event
	 * @param e
	 */
	protected onCallChild(e: ParentMessage<this>): void {
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
	 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
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
	 * Component destructor
	 */
	@p({replace: false})
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
		this.async.clearAll().locked = true;

		try {
			delete classesCache.dict.els?.[this.componentId];
		} catch {}
	}
}

function defaultI18n(this: iBlock, ...args: unknown[]): string {
	// eslint-disable-next-line @typescript-eslint/no-extra-parens
	return (Object.isFunction(this.r.i18n) ? this.r.i18n : ((i18n))).apply(this.r, args);
}
