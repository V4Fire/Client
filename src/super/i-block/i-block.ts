/* eslint-disable max-lines,@typescript-eslint/unified-signatures */

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
import SyncPromise from 'core/promise/sync';

import log, { LogMessageOptions } from 'core/log';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import config from 'config';

import Async, {

	wrapWithSuspending,

	AsyncOptions,
	ClearOptionsId,

	ProxyCb,
	BoundFn,
	EventId

} from 'core/async';

//#if runtime has core/helpers
import * as helpers from 'core/helpers';
//#endif

//#if runtime has core/browser
import * as browser from 'core/browser';
//#endif

import * as presets from 'presets';

import type bRouter from 'base/b-router/b-router';
import type iStaticPage from 'super/i-static-page/i-static-page';

import {

	component,
	PARENT,

	globalEmitter,
	customWatcherRgxp,

	resolveRefs,
	bindRemoteWatchers,

	WatchPath,
	RawWatchHandler,

	Hook,

	ComponentInterface,
	UnsafeGetter

} from 'core/component';

import remoteState from 'core/component/state';
import * as init from 'core/component/construct';

import 'super/i-block/directives';
import { statuses } from 'super/i-block/const';

import Cache from 'super/i-block/modules/cache';
import Opt from 'super/i-block/modules/opt';

import Daemons, { DaemonsDict } from 'super/i-block/modules/daemons';
import Analytics from 'super/i-block/modules/analytics';

import DOM from 'super/i-block/modules/dom';
import VDOM from 'super/i-block/modules/vdom';

import Lfc from 'super/i-block/modules/lfc';
import AsyncRender from 'friends/async-render';
import Sync, { AsyncWatchOptions } from 'super/i-block/modules/sync';

import Block from 'super/i-block/modules/block';
import Field from 'super/i-block/modules/field';

import Provide, { classesCache, Classes } from 'super/i-block/modules/provide';
import State, { ConverterCallType } from 'super/i-block/modules/state';
import Storage from 'super/i-block/modules/storage';
import ModuleLoader, { Module } from 'friends/module-loader';

import {

	wrapEventEmitter,
	EventEmitterWrapper,
	ReadonlyEventEmitterWrapper

} from 'super/i-block/modules/event-emitter';

import { initGlobalListeners, initRemoteWatchers } from 'super/i-block/modules/listeners';
import { readyStatuses, activate, deactivate } from 'super/i-block/modules/activation';

import type {

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
export * from 'friends/module-loader';

export * from 'super/i-block/modules/daemons';
export * from 'super/i-block/modules/event-emitter';

export * from 'super/i-block/modules/sync';
export * from 'friends/async-render';
export * from 'super/i-block/modules/decorators';

export { default as Friend } from 'friends/friend';

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
	override readonly Component!: iBlock;
	override readonly Root!: iStaticPage;

	// @ts-ignore (override)
	override readonly $root!: this['Root'];

	/**
	 * If true, the component will log info messages, but not only errors and warnings
	 */
	@prop(Boolean)
	readonly verbose: boolean = false;

	/**
	 * Component unique identifier
	 */
	@system({
		atom: true,
		unique: (ctx, oldCtx) => !ctx.$el?.classList.contains(oldCtx.componentId),
		init: () => `uid-${Math.random().toString().slice(2)}`
	})

	override readonly componentId!: string;

	/**
	 * A unique or global name of the component.
	 * It's used to enable synchronization of component data with different storages: local, router, etc.
	 */
	@prop({type: String, required: false})
	readonly globalName?: string;

	/**
	 * Type of the component' root tag
	 */
	@prop(String)
	readonly rootTag: string = 'div';

	/**
	 * Dictionary with additional attributes for the component' root tag
	 */
	get rootAttrs(): Dictionary {
		return this.field.get<Dictionary>('rootAttrsStore')!;
	}

	/**
	 * A component render cache key.
	 * It's used to cache the component vnode.
	 */
	@prop({required: false})
	readonly renderKey?: string;

	/**
	 * An initial component stage value.
	 *
	 * The stage property can be used to mark different states of the component.
	 * For example, we have a component that implements a form of image uploading,
	 * and we have two variants of the form: upload by a link or upload from a computer.
	 *
	 * Therefore, we can create two-stage values: 'link' and 'file' to separate the component template by two variants of
	 * a markup depending on the stage value.
	 */
	@prop({type: [String, Number], required: false})
	readonly stageProp?: Stage;

	/**
	 * Component stage value
	 * @see [[iBlock.stageProp]]
	 */
	@computed()
	get stage(): CanUndef<Stage> {
		return this.field.get('stageStore');
	}

	/**
	 * Sets a new component stage value.
	 * By default, it clears all async listeners from the group of `stage.${oldGroup}`.
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
	@computed()
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * Initial component modifiers.
	 * The modifiers represent API to bind component state properties directly with CSS classes
	 * without unnecessary component re-rendering.
	 */
	@prop({type: Object, required: false})
	readonly modsProp?: ModsTable;

	/**
	 * Component modifiers
	 * @see [[iBlock.modsProp]]
	 */
	@system({
		merge: mergeMods,
		init: initMods
	})

	readonly mods!: ModsNTable;

	/**
	 * If true, the component is activated.
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
	 * This parameter can be helpful if you are using a keep-alive directive within your template.
	 * For example, you have a page within keep-alive, and after back to this page, the component will be forcibly drawn
	 * from a keep-alive cache, but after this page will try to update data in silence.
	 */
	@prop(Boolean)
	readonly reloadOnActivation: boolean = false;

	/**
	 * If true, then the component will force rendering on re-activation.
	 * This parameter can be helpful if you are using a keep-alive directive within your template.
	 */
	@prop(Boolean)
	readonly renderOnActivation: boolean = false;

	/**
	 * List of additional dependencies to load.
	 * These dependencies will be dynamically loaded during the `initLoad` invoking.
	 *
	 * @example
	 * ```js
	 * {
	 *   dependencies: [
	 *     {name: 'b-button', load: () => import('form/b-button')}
	 *   ]
	 * }
	 * ```
	 */
	@prop({type: Array, required: false})
	readonly dependenciesProp: Module[] = [];

	/**
	 * List of additional dependencies to load
	 * @see [[iBlock.dependenciesProp]]
	 */
	@system((o) => o.sync.link((val) => {
		const componentStaticDependencies = config.componentStaticDependencies[o.componentName];
		return Array.concat([], componentStaticDependencies, val);
	}))

	dependencies!: Module[];

	/**
	 * If true, the component is marked as a remote provider.
	 * It means, that a parent component will wait for the loading of the current component.
	 */
	@prop(Boolean)
	readonly remoteProvider: boolean = false;

	/**
	 * If true, the component will listen for the special event of its parent.
	 * It's used to provide a common functionality of proxy calls from the parent.
	 */
	@prop(Boolean)
	readonly proxyCall: boolean = false;

	/**
	 * If true, the component state will be synchronized with a router after initializing.
	 * For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router.
	 *
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @field()
	 *   stage: string = 'defaultStage';
	 *
	 *   syncRouterState(data?: Dictionary) {
	 *     // This notation means that if there is a value within `route.query`
	 *     // it will be mapped to the component as `stage`.
	 *     // If a route was changed, the mapping repeat.
	 *     // Also, if the `stage` field of the component was changed,
	 *     // it will be mapped to the router query parameters as `stage` by using `router.push`.
	 *     return {stage: data?.stage || this.stage};
	 *   }
	 * }
	 * ```
	 *
	 * But, if in some cases we don't have `stage` within `route.query`, and the component have the default value,
	 * we trap in a situation where exists route, which wasn't synchronized with the component, and
	 * it can affect to the "back" logic. Sometimes, this behavior does not match our expectations.
	 * But if we toggle `syncRouterStoreOnInit` to true, the component will forcibly map its own state to
	 * the router after initializing.
	 */
	@prop(Boolean)
	readonly syncRouterStoreOnInit: boolean = false;

	/**
	 * If true, the component will skip waiting of remote providers to avoid redundant re-renders.
	 * This prop can help optimize your non-functional component when it does not contain any remote providers.
	 * By default, this prop is calculated automatically based on component dependencies.
	 */
	@prop({type: Boolean, required: false})
	readonly dontWaitRemoteProvidersProp?: boolean;

	/** @see [[iBlock.dontWaitRemoteProvidersProp]] */
	@system((o) => o.sync.link((val) => {
		if (val == null) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (o.dontWaitRemoteProviders != null) {
				return o.dontWaitRemoteProviders;
			}

			const isRemote = /\bremote-provider\b/;
			return !config.components[o.componentName]?.dependencies.some((dep) => isRemote.test(dep));
		}

		return val;
	}))

	dontWaitRemoteProviders!: boolean;

	/**
	 * A map of remote component watchers.
	 * The usage of this mechanism is similar to the "@watch" decorator:
	 *   *) As a key, we declare a name of a component method that we want to call;
	 *   *) As a value, we declare a path to a property/event we want to watch/listen.
	 *      Also, the method can take additional parameters of watching.
	 *      Mind, the properties/events are taken from a component that contents the current.
	 *
	 * @see [[iBlock.watch]]
	 * @example
	 * ```js
	 * // We have two components: A and B.
	 * // We want to declare that component B must call its own `reload` method on an event from component A.
	 *
	 * {
	 *   // If we want to listen for events, we should use the ":" syntax.
	 *   // Also, we can provide a different event emitter as `link:`,
	 *   // for instance, `document:scroll`
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
	 *     // Listens `foo` events from `A`
	 *     ':foo',
	 *
	 *     // Watches for changes of the `A.bla` property
	 *     'bla',
	 *
	 *     // Listens `window.document` scroll event,
	 *     // does not provide event arguments to `reload`
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
	 * if the parent also has this property as true, then the events will bubble to the next (from the hierarchy)
	 * parent component.
	 *
	 * All dispatching events have special prefixes to avoid collisions with events from other components,
	 * for example: bButton `click` will bubble as `b-button::click`.
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

	@prop({type: Object, required: false})
	override readonly classes?: Dictionary<CanArray<string>>;

	@prop({type: Object, required: false})
	override readonly styles?: Dictionary<CanArray<string> | Dictionary<string>>;

	/**
	 * Link to a `i18n` function that will be used to localize string literals
	 */
	@prop(Function)
	readonly i18n: typeof i18n = ((i18n));

	/**
	 * A Link to the remote state object.
	 *
	 * The remote state object is a special watchable object that provides some parameters
	 * that can't be initialized within a component directly. You can modify this object outside of components,
	 * but remember that these mutations may force the re-rendering of all components.
	 */
	@computed({watchable: true})
	get remoteState(): typeof remoteState {
		return remoteState;
	}

	/**
	 * A component status.
	 * This parameter is pretty similar to the `hook` parameter.
	 * But, the hook represents a component status relative to its MVVM instance: created, mounted, destroyed, etc.
	 * Opposite to "hook", "componentStatus" represents a logical component status:
	 *
	 *   *) unloaded - a component was just created without any initializing:
	 *      this status can intersect with some hooks, like `beforeCreate` or `created`.
	 *
	 *   *) loading - a component starts to load data from its own providers:
	 *      this status can intersect with some hooks, like `created` or `mounted`.
	 *      If the component was mounted with this status, you can show by using UI that the data is loading.
	 *
	 *   *) beforeReady - a component was fully loaded and started to prepare to render:
	 *      this status can intersect with some hooks like `created` or `mounted`.
	 *
	 *   *) ready - a component was fully loaded and rendered:
	 *      this status can intersect with the `mounted` hook.
	 *
	 *   *) inactive - a component is frozen by keep-alive mechanism or special input property:
	 *      this status can intersect with the `deactivated` hook.
	 *
	 *   *) destroyed - a component was destroyed:
	 *      this status can intersect with some hooks, like `beforeDestroy` or `destroyed`.
	 */
	@computed()
	get componentStatus(): ComponentStatus {
		return this.shadowComponentStatusStore ?? this.field.get<ComponentStatus>('componentStatusStore') ?? 'unloaded';
	}

	/**
	 * Sets a new component status.
	 * Notice, not all statuses emit component' re-rendering: `unloaded`, `inactive`, `destroyed` will emit only an event.
	 *
	 * @param value
	 * @emits `componentStatus:{$value}(value: ComponentStatus, oldValue: ComponentStatus)`
	 * @emits `componentStatusChange(value: ComponentStatus, oldValue: ComponentStatus)`
	 */
	set componentStatus(value: ComponentStatus) {
		const
			oldValue = this.componentStatus;

		if (oldValue === value && value !== 'beforeReady') {
			return;
		}

		const isShadowStatus =
			this.isNotRegular ||

			value === 'ready' && oldValue === 'beforeReady' ||
			value === 'inactive' && !this.renderOnActivation ||

			(<typeof iBlock>this.instance.constructor).shadowComponentStatuses[value];

		if (isShadowStatus) {
			this.shadowComponentStatusStore = value;

		} else {
			this.shadowComponentStatusStore = undefined;
			this.field.set('componentStatusStore', value);

			if (this.isReady && this.dependencies.length > 0) {
				void this.forceUpdate();
			}
		}

		this.emit(`componentStatus:${value}`, value, oldValue);
		this.emit('componentStatusChange', value, oldValue);
	}

	override get hook(): Hook {
		return this.hookStore;
	}

	protected override set hook(value: Hook) {
		const oldValue = this.hook;
		this.hookStore = value;

		if ('lfc' in this && !this.lfc.isBeforeCreate('beforeDataCreate')) {
			this.emit(`componentHook:${value}`, value, oldValue);
			this.emit('componentHookChange', value, oldValue);
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

		return o.sync.link('activatedProp', (val: CanUndef<boolean>) => {
			val = val !== false;

			if (o.hook !== 'beforeDataCreate') {
				o[val ? 'activate' : 'deactivate']();
			}

			return val;
		});
	})

	isActivated!: boolean;

	/**
	 * True if the component was in `ready` status at least once
	 */
	@system({unique: true})
	isReadyOnce: boolean = false;

	/**
	 * Link to the component root
	 */
	get r(): this['$root'] {
		const r = this.$root;
		return r.unsafe.$remoteParent?.$root ?? r;
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
	 * True if the current component is completely ready to work.
	 * The `ready` status is mean, that component was mounted an all data provider are loaded.
	 */
	@computed()
	get isReady(): boolean {
		return Boolean(readyStatuses[this.componentStatus]);
	}

	/**
	 * True if the current component is a functional
	 */
	@computed()
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * True if the current component is a functional or flyweight
	 */
	@computed()
	get isNotRegular(): boolean {
		return Boolean(this.isFunctional);
	}

	/**
	 * True if the current component is rendered by using server-side rendering
	 */
	@computed()
	get isSSR(): boolean {
		return this.$renderEngine.supports.ssr;
	}

	/**
	 * Base component modifiers.
	 * These modifiers are automatically provided to child components.
	 * So, for example, you have a component that uses another component within your template,
	 * and you specify to the outer component some theme modifier.
	 * This modifier will recursively provide to all child components.
	 */
	@computed()
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
	 * This property provides a bunch of methods to access a component property safely.
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
	 * This property provides a bunch of methods to organize a "link" from one component property to another.
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
		init: (ctx) => new AsyncRender(ctx)
	})

	readonly asyncRender!: AsyncRender;

	/**
	 * API to work with a component' VDOM tree
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new VDOM(ctx)
	})

	readonly vdom!: VDOM;

	override get unsafe(): UnsafeGetter<UnsafeIBlock<this>> {
		return Object.cast(this);
	}

	/**
	 * The special link to a parent component.
	 * This parameter is used with the static declaration of modifiers to refer to parent modifiers.
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
	 * A map of component shadow statuses.
	 * These statuses don't emit re-rendering of a component.
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
	 * This declaration helps to declare the default value of a modifier: wrap the value with square brackets.
	 * Also, all modifiers that are declared can be provided to a component not only by using `modsProp`, but as an own
	 * prop value. In addition to previous benefits, if you provide all available values of modifiers to the declaration,
	 * it can be helpful for runtime reflection.
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
		diff: [
			'true',
			'false'
		],

		theme: [],
		exterior: [],
		stage: []
	};

	/**
	 * A map of static component daemons.
	 * A daemon is a special object that can watch component properties,
	 * listen to component events/hooks and do some useful payload, like sending analytic or performance events.
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * Internal dictionary with additional attributes for the component' root tag
	 * @see [[iBlock.rootAttrsStore]]
	 */
	@field()
	protected rootAttrsStore: Dictionary = {};

	/**
	 * API for daemons
	 */
	@system({
		unique: true,
		init: (ctx) => new Daemons(ctx)
	})

	protected readonly daemons!: Daemons;

	/**
	 * API for the component local storage
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Storage(ctx)
	})

	protected readonly storage!: Storage;

	/**
	 * API for the component state.
	 * This property provides a bunch of helper methods to initialize the component state.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new State(ctx)
	})

	protected readonly state!: State;

	/**
	 * API to work with a component' DOM tree
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
	 * API for optimization and debugging.
	 * This property provides a bunch of helper methods to optimize some operations.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Opt(ctx)
	})

	protected readonly opt!: Opt;

	/**
	 * API for the dynamic dependencies.
	 * This property provides a bunch of methods to load the dynamic dependencies of the component.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new ModuleLoader(ctx)
	})

	protected readonly moduleLoader!: ModuleLoader;

	@system()
	protected override renderCounter: number = 0;

	/**
	 * Component stage store
	 * @see [[iBlock.stageProp]]
	 */
	@field({
		forceUpdate: false,
		functionalWatching: false,
		init: (o) => o.sync.link<CanUndef<Stage>>((val) => {
			o.stage = val;
			return o.field.get('stageStore');
		})
	})

	protected stageStore?: Stage;

	/**
	 * Component hook store
	 * @see [[iBlock.hook]]
	 */
	protected hookStore: Hook = 'beforeRuntime';

	/**
	 * Component initialize status store
	 * @see [[iBlock.componentStatus]]
	 */
	@field({
		unique: true,
		forceUpdate: false,
		functionalWatching: false
	})

	protected componentStatusStore: ComponentStatus = 'unloaded';

	/**
	 * Component initialize status store for unwatchable statuses
	 * @see [[iBlock.componentStatus]]
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: ComponentStatus;

	/**
	 * Store of component modifiers that can emit re-rendering of the component
	 */
	@field({
		merge: true,
		functionalWatching: false,
		init: () => Object.create({})
	})

	protected watchModsStore!: ModsNTable;

	/**
	 * True if the component context is based on another component via `vdom.bindRenderObject`
	 */
	protected readonly isVirtualTpl: boolean = false;

	/**
	 * Special getter for component modifiers:
	 * on the first touch of a property from that object will be registered a modifier by the property name
	 * that can emit re-rendering of the component.
	 * Don't use this getter outside the component template.
	 */
	@computed({cache: true})
	protected get m(): Readonly<ModsNTable> {
		return getWatchableMods(this);
	}

	/**
	 * Cache object for `opt.ifOnce`
	 */
	@system({merge: true})
	protected readonly ifOnceStore: Dictionary<number> = {};

	/**
	 * A temporary cache.
	 * Mutation of this object don't emits re-rendering of the component.
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected tmp!: Dictionary;

	/**
	 * A temporary cache.
	 * Mutation of this object emits re-rendering of the component.
	 */
	@field({merge: true})
	protected watchTmp: Dictionary = {};

	/**
	 * Cache of watched values
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected watchCache!: Dictionary;

	/**
	 * Link to the current component
	 */
	@computed()
	protected get self(): this {
		return this;
	}

	/**
	 * Self event emitter
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, {
			on: o.$on.bind(o),
			once: o.$once.bind(o),
			off: o.$off.bind(o)
		})
	})

	protected readonly selfEmitter!: EventEmitterWrapper<this>;

	/**
	 * Local event emitter: all events that are fired from this emitter don't bubble
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, new EventEmitter({
			maxListeners: 1e3,
			newListener: false,
			wildcard: true
		}), {suspend: true})
	})

	protected readonly localEmitter!: EventEmitterWrapper<this>;

	/**
	 * Event emitter of a parent component
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, () => o.$parent, true)
	})

	protected readonly parentEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * Event emitter of the root component
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, o.r)
	})

	protected readonly rootEmitter!: EventEmitterWrapper<this>;

	/**
	 * The global event emitter of an application.
	 * It can be used to provide external events to a component.
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => wrapEventEmitter(<Async>d.async, globalEmitter)
	})

	protected readonly globalEmitter!: EventEmitterWrapper<this>;

	/**
	 * A map of extra helpers.
	 * It can be useful to provide some helper functions to a component.
	 */
	@system({
		atom: true,
		unique: true,
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
		init: () => presets
	})

	protected readonly presets!: typeof presets;

	/**
	 * Number of `beforeReady` event listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * A list of `blockReady` listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected blockReadyListeners: Function[] = [];

	/**
	 * Alias for `i18n`
	 */
	@computed()
	protected get t(): this['i18n'] {
		return this.i18n;
	}

	/**
	 * Link to `globalThis.l`
	 */
	@system({
		atom: true,
		unique: true
	})

	protected readonly l: typeof l = globalThis.l;

	/**
	 * Link to the console API
	 */
	@system({
		atom: true,
		unique: true,
		init: () => console
	})

	protected readonly console!: Console;

	/**
	 * Link to `window.location`
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
		init: () => globalThis
	})

	protected readonly global!: Window;

	/**
	 * Sets a watcher to a component/object property or event by the specified path.
	 *
	 * When you watch for some property changes, the handler function can take the second argument that refers
	 * to the old value of a property. If the object watching is non-primitive, the old value will be cloned from the
	 * original old value to avoid having two links to one object.
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
	 * You need to use the special delimiter ":" within a path to listen to an event.
	 * Also, you can specify an event emitter to listen to by writing a link before ":".
	 * For instance:
	 *
	 * 1. `':onChange'` - a component will listen to its own event `onChange`;
	 * 2. `'localEmitter:onChange'` - a component will listen to an event `onChange` from `localEmitter`;
	 * 3. `'$parent.localEmitter:onChange'` - a component will listen to an event `onChange` from `$parent.localEmitter`;
	 * 4. `'document:scroll'` - a component will listen to an event `scroll` from `window.document`.
	 *
	 * A link to the event emitter is taken from component properties or the global object.
	 * The empty link '' is a link to a component itself.
	 *
	 * Also, if you listen to an event, you can manage when to start to listen to the event by using special characters
	 * at the beginning of a path string:
	 *
	 * 1. `'!'` - start to listen to an event on the "beforeCreate" hook, for example: `'!rootEmitter:reset'`;
	 * 2. `'?'` - start to listen an event on the "mounted" hook, for example: `'?$el:click'`.
	 *
	 * By default, all events start to listen on the "created" hook.
	 *
	 * To listen for changes of another watchable object, you need to specify the watch path as an object:
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
	 * // Watch for changes of `foo`
	 * this.watch('foo', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of another watchable object
	 * this.watch({ctx: anotherObject, path: 'foo'}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Deep watch for changes of `foo`
	 * this.watch('foo', {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of `foo.bla`
	 * this.watch('foo.bla', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to `onChange` event of the current component
	 * this.watch(':onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to `onChange` event of `parentEmitter`
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

	@p()
	watch<T = unknown>(
		path: WatchPath | object,
		optsOrHandler: AsyncWatchOptions | RawWatchHandler<this, T>,
		handlerOrOpts?: RawWatchHandler<this, T> | AsyncWatchOptions
	): void {
		const
			{async: $a} = this;

		if (this.isSSR) {
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

		opts ??= {};

		if (Object.isString(path) && RegExp.test(customWatcherRgxp, path)) {
			bindRemoteWatchers(this, {
				async: $a,
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
			// eslint-disable-next-line prefer-const
			let link, unwatch;

			const emitter = (_, wrappedHandler: Function) => {
				wrappedHandler['originalLength'] = handler['originalLength'] ?? handler.length;
				handler = wrappedHandler;

				$a.worker(() => {
					if (link != null) {
						$a.off(link);
					}
				}, opts);

				return () => unwatch?.();
			};

			link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(opts, 'watchers'));
			unwatch = this.$watch(Object.cast(path), opts, handler);
		});
	}

	/**
	 * Returns true, if the specified event can be dispatched as an own component event (`selfDispatching`)
	 * @param event
	 */
	canSelfDispatchEvent(event: string): boolean {
		return !/^component-(?:status|hook)(?::\w+(-\w+)*|-change)$/.test(event);
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
	@p()
	emit(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			eventDecl = Object.isString(event) ? {event} : event,
			eventName = eventDecl.event.dasherize();

		eventDecl.event = eventName;

		this.$emit(eventName, this, ...args);
		this.$emit(`on-${eventName}`, ...args);

		if (this.dispatching) {
			this.dispatch(eventDecl, ...args);
		}

		const
			logArgs = args.slice();

		if (eventDecl.type === 'error') {
			for (let i = 0; i < logArgs.length; i++) {
				const
					el = logArgs[i];

				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			}
		}

		this.log(`event:${eventName}`, this, ...logArgs);
	}

	/**
	 * Emits a component error event
	 * (all functions from arguments will be wrapped for logging)
	 *
	 * @param event
	 * @param args
	 */
	@p()
	emitError(event: string, ...args: unknown[]): void {
		this.emit({event, type: 'error'}, ...args);
	}

	/**
	 * Emits a component event to a parent component
	 *
	 * @param event
	 * @param args
	 */
	@p()
	dispatch(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			eventDecl = Object.isString(event) ? {event} : event,
			eventName = eventDecl.event.dasherize();

		eventDecl.event = eventName;

		let {
			componentName,
			$parent: parent
		} = this;

		const
			globalName = (this.globalName ?? '').dasherize(),
			logArgs = args.slice();

		if (eventDecl.type === 'error') {
			for (let i = 0; i < logArgs.length; i++) {
				const
					el = logArgs[i];

				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			}
		}

		while (parent) {
			if (parent.selfDispatching && parent.canSelfDispatchEvent(eventName)) {
				parent.$emit(eventName, this, ...args);
				parent.$emit(`on-${eventName}`, ...args);
				parent.log(`event:${eventName}`, this, ...logArgs);

			} else {
				parent.$emit(`${componentName}::${eventName}`, this, ...args);
				parent.$emit(`${componentName}::on-${eventName}`, ...args);
				parent.log(`event:${componentName}::${eventName}`, this, ...logArgs);

				if (globalName !== '') {
					parent.$emit(`${globalName}::${eventName}`, this, ...args);
					parent.$emit(`${globalName}::on-${eventName}`, ...args);
					parent.log(`event:${globalName}::${eventName}`, this, ...logArgs);
				}
			}

			if (!parent.dispatching) {
				break;
			}

			parent = parent.$parent;
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
	on<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		this.selfEmitter.on(event.dasherize(), handler, opts);
	}

	/**
	 * Attaches a disposable event listener to the specified component event
	 *
	 * @see [[Async.once]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		this.selfEmitter.once(event.dasherize(), handler, opts);
	}

	/**
	 * Returns a promise that is resolved after emitting the specified component event
	 *
	 * @see [[Async.promisifyOnce]]
	 * @param event
	 * @param [opts] - additional options
	 */
	promisifyOnce<T = unknown>(event: string, opts?: AsyncOptions): Promise<T> {
		return this.selfEmitter.promisifyOnce(event.dasherize(), opts);
	}

	/**
	 * Detaches an event listeners from the component
	 *
	 * @see [[Async.off]]
	 * @param [opts] - additional options
	 */
	off(opts?: ClearOptionsId<EventId>): void {
		this.selfEmitter.off(opts);
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
	 * The method returns a promise resulting from invoking the function or raw result without wrapping
	 * if the component is already in the specified status.
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

	@p()
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
	 * Executes the specified function on the next render tick
	 *
	 * @see [[Async.proxy]]
	 * @param fn
	 * @param [opts] - additional options
	 */
	nextTick(fn: BoundFn<this>, opts?: AsyncOptions): void;

	/**
	 * Returns a promise that will be resolved on the next render tick
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
	 * Forces the component' re-rendering
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

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const done = () => {
			const get = () => {
				if (Object.isFunction(data)) {
					try {
						return data.call(this);

					} catch (err) {
						stderr(err);
						return;
					}
				}

				return data;
			};

			this.componentStatus = 'beforeReady';

			void this.lfc.execCbAfterBlockReady(() => {
				this.isReadyOnce = true;
				this.componentStatus = 'ready';

				if (this.beforeReadyListeners > 1) {
					this.nextTick()
						.then(() => {
							this.beforeReadyListeners = 0;
							this.emit('initLoad', get(), opts);
						})
						.catch(stderr);

				} else {
					this.emit('initLoad', get(), opts);
				}
			});
		};

		const doneOnError = (err) => {
			stderr(err);
			done();
		};

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			const tasks = <Array<Promise<unknown>>>Array.concat(
				[],

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				this.moduleLoader.load?.(...this.dependencies) || [],

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				this.state.initFromStorage() || []
			);

			if (
				(this.isNotRegular || this.dontWaitRemoteProviders) &&
				!this.$renderEngine.supports.ssr
			) {
				if (tasks.length > 0) {
					const res = $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
					this.$initializer = res;
					return res;
				}

				done();
				return;
			}

			const res = this.nextTick(label).then((() => {
				const
					{$children: childComponents} = this;

				if (childComponents) {
					for (let i = 0; i < childComponents.length; i++) {
						const
							component = childComponents[i],
							status = component.componentStatus;

						if (component.remoteProvider && Object.isTruly(statuses[status])) {
							if (status === 'ready') {
								if (opts.recursive) {
									component.reload({silent: opts.silent === true, ...opts}).catch(stderr);

								} else {
									continue;
								}
							}

							let
								isLoaded = false;

							tasks.push(Promise.race([
								component.waitStatus('ready').then(() => isLoaded = true),

								$a.sleep((10).seconds(), {}).then(() => {
									if (isLoaded) {
										return;
									}

									this.log(
										{
											logLevel: 'warn',
											context: 'initLoad:remoteProviders'
										},

										{
											message: 'The component is waiting too long a remote provider',
											waitFor: {
												globalName: component.globalName,
												component: component.componentName,
												dataProvider: Object.get(component, 'dataProvider')
											}
										}
									);
								})
							]));
						}
					}
				}

				return $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
			}));

			this.$initializer = res;
			return res;

		} catch (err) {
			doneOnError(err);
		}
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

	@p()
	setMod(nodeOrName: Element | string, name: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
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

	@p()
	removeMod(nodeOrName: Element | string, name?: string | unknown, value?: unknown): CanPromise<boolean> {
		if (Object.isString(nodeOrName)) {
			const res = this.lfc.execCbAfterBlockReady(() => this.block!.removeMod(nodeOrName, name));
			return res ?? false;
		}

		const ctx = this.dom.createBlockCtxFromNode(nodeOrName);
		return Block.prototype.removeMod.call(ctx, name, value);
	}

	/**
	 * Sets a modifier to the root element of an application.
	 *
	 * This method is useful when you need to attach a class can affect to the whole application,
	 * for instance, you want to lock page scrolling, i.e. you need to add a class to the root HTML tag.
	 *
	 * The method uses `globalName` of the component if it's provided. Otherwise, `componentName`.
	 *
	 * @param name - modifier name
	 * @param value - modifier value
	 *
	 * @example
	 * ```js
	 * // this.componentName === 'b-button' && this.globalName === undefined
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-button-foo-bla'));
	 *
	 * // this.componentName === 'b-button' && this.globalName === 'bAz'
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla'));
	 * ```
	 */
	@p()
	setRootMod(name: string, value: unknown): boolean {
		return this.r.setRootMod(name, value, this);
	}

	/**
	 * Removes a modifier from the root element of an application.
	 * The method uses `globalName` of the component if it's provided. Otherwise, `componentName`.
	 *
	 * @param name - modifier name
	 * @param [value] - modifier value (if not specified, the method removes the matched modifier with any value)
	 *
	 * @example
	 * ```js
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-button-foo-bla'));
	 *
	 * this.removeRootMod('foo', 'baz');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla') === true);
	 *
	 * this.removeRootMod('foo');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla') === false);
	 * ```
	 */
	@p()
	removeRootMod(name: string, value?: unknown): boolean {
		return this.r.removeRootMod(name, value, this);
	}

	/**
	 * Returns a value of the specified root element modifier.
	 * The method uses `globalName` of the component if it's provided, otherwise, `componentName`.
	 * Notice that the method returns a normalized value.
	 *
	 * @param name - modifier name
	 * @example
	 * ```js
	 * this.setRootMod('foo', 'blaBar');
	 * console.log(this.getRootMod('foo') === 'bla-bar');
	 * ```
	 */
	@p()
	getRootMod(name: string): CanUndef<string> {
		return this.r.getRootMod(name, this);
	}

	/**
	 * @see [[iBlock.activatedProp]]
	 * @param [force]
	 */
	override activate(force?: boolean): void {
		activate(this, force);
	}

	/** @see [[iBlock.activatedProp]] */
	override deactivate(): void {
		deactivate(this);
	}

	/**
	 * @param ctxOrOpts
	 * @param details
	 */
	@p()
	override log(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void {
		let
			context = ctxOrOpts,
			logLevel;

		if (!Object.isString(ctxOrOpts)) {
			logLevel = ctxOrOpts.logLevel;
			context = ctxOrOpts.context;
		}

		if (!this.verbose && (logLevel == null || logLevel === 'info')) {
			return;
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
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - component constructor
	 */
	isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T} | Function): obj is T {
		return Object.isTruly(obj) && (<Dictionary>obj).instance instanceof (constructor ?? iBlock);
	}

	/**
	 * This method works as a two-way connector between local storage and a component.
	 *
	 * When the component initializes, it asks the local storage for data associated with it by using a global name
	 * as a namespace to search. When the local storage is ready to provide data to the component,
	 * it passes data to this method. After this, the method returns a dictionary mapped to the component as properties
	 * (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the local storage
	 * by using this method. When the component provides local storage data, the method's second argument
	 * is equal to `'remote'`.
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
	protected convertStateToStorageReset(data?: Dictionary): Dictionary {
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
	 * After this, the method returns a dictionary mapped to the
	 * component as properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property that was in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the router
	 * by using this method (the router will produce a new transition by using `push`).
	 * When the component provides router data, the method's second argument is equal to `'remote'`.
	 *
	 * Mind that the router is global for all components, i.e., a dictionary that this method passes to the router
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
	protected convertStateToRouterReset(data?: Dictionary): Dictionary {
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
	 * Waits until the specified reference won't be available and returns it.
	 * The method returns a promise.
	 *
	 * @see [[Async.wait]]
	 * @param ref - ref name
	 * @param [opts] - additional options
	 */
	@p()
	protected waitRef<T = CanArray<iBlock | Element>>(ref: string, opts?: AsyncOptions): Promise<T> {
		let
			that = <iBlock>this;

		if (this.isNotRegular) {
			ref += `:${this.componentId}`;
			that = this.$normalParent ?? that;
		}

		that.$refHandlers[ref] = that.$refHandlers[ref] ?? [];

		const
			watchers = that.$refHandlers[ref],
			refVal = that.$refs[ref];

		return this.async.promise<T>(() => new SyncPromise((resolve) => {
			if (refVal != null && (!Object.isArray(refVal) || refVal.length > 0)) {
				resolve(<T>refVal);

			} else {
				watchers?.push(resolve);
			}
		}), opts);
	}

	/**
	 * Initializes the core component API
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
		this.emit = i.emit.bind(this);
	}

	/**
	 * Initializes an instance of the `Block` class for the current component
	 */
	@hook('mounted')
	@p()
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

		if (this.blockReadyListeners.length > 0) {
			for (let i = 0; i < this.blockReadyListeners.length; i++) {
				this.blockReadyListeners[i]();
			}

			this.blockReadyListeners = [];
		}
	}

	/**
	 * Initializes the global event listeners
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
		this.sync.mod('stage', 'stageStore', (v) => v == null ? v : String(v));
	}

	/**
	 * Initializes remote watchers from the prop
	 */
	@hook({beforeDataCreate: {functional: false}})
	protected initRemoteWatchers(): void {
		initRemoteWatchers(this);
	}

	/**
	 * Initializes the `callChild` event listener
	 */
	@watch({field: 'proxyCall', immediate: true})
	protected initCallChildListener(value: boolean): void {
		if (!value) {
			return;
		}

		this.parentEmitter.on('onCallChild', this.onCallChild.bind(this));
	}

	/**
	 * Factory to create listeners from internal hook events
	 * @param hook - hook name to listen
	 */
	protected createInternalHookListener(hook: string): Function {
		return (...args) => (<Function>this[`on-${hook}-hook`.camelize(false)]).call(this, ...args);
	}

	/**
	 * Handler: `callChild` event
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
	 * Hook handler: the component has been mounted
	 * @emits `mounted(el: Element)`
	 */
	@hook('mounted')
	protected onMounted(): void {
		this.emit('mounted', this.$el);
	}

	protected override onCreatedHook(): void {
		if (this.isSSR) {
			this.componentStatusStore = 'ready';
			this.isReadyOnce = true;
		}
	}

	protected override onBindHook(): void {
		init.beforeMountState(this);
	}

	protected override onInsertedHook(): void {
		init.mountedState(this);
	}

	protected override async onUpdateHook(): Promise<void> {
		try {
			await this.nextTick({label: $$.onUpdateHook});

			this.onBindHook();
			this.onInsertedHook();

			if (this.$normalParent != null) {
				resolveRefs(this.$normalParent);
			}

		} catch (err) {
			stderr(err);
		}
	}

	protected override onUnbindHook(): void {
		const
			parent = this.$normalParent;

		const needImmediateDestroy =
			parent == null ||
			parent.componentStatus === 'destroyed' ||
			parent.r === parent;

		if (needImmediateDestroy) {
			this.$destroy();

		} else {
			this.async.on(parent, 'on-component-hook:before-destroy', this.$destroy.bind(this), {
				label: $$.onUnbindHook,
				group: ':zombie'
			});

			this.async.clearAll().locked = true;
		}
	}

	/**
	 * Hook handler: component will be destroyed
	 */
	@p()
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
		this.async.clearAll().locked = true;

		try {
			delete classesCache.dict.els?.[this.componentId];
		} catch {}
	}
}
