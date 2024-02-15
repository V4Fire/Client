/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/state/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type Async from 'core/async';
import type { BoundFn } from 'core/async';

import { initGlobalEnv } from 'core/env';
import { i18nFactory } from 'core/prelude/i18n';
import { component, clientState, hook, hydrationStore, Hook, State } from 'core/component';

import type bRouter from 'components/base/b-router/b-router';
import type iBlock from 'components/super/i-block/i-block';

import type { Module } from 'components/friends/module-loader';
import type { ConverterCallType } from 'components/friends/state';
import { readyStatuses } from 'components/super/i-block/modules/activation';

import { field, system, computed, wait, WaitDecoratorOptions } from 'components/super/i-block/decorators';
import type { Stage, ComponentStatus, ComponentStatuses } from 'components/super/i-block/interface';

import iBlockMods from 'components/super/i-block/mods';

@component()
export default abstract class iBlockState extends iBlockMods {
	/**
	 * A list of additional dependencies to load when the component is initializing
	 * {@link iBlock.dependenciesProp}
	 */
	@system((o) => o.sync.link((val: Iterable<Module>) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	dependencies!: Module[];

	/**
	 * True if the component has been in the `ready` state at least once
	 */
	@system({unique: true})
	isReadyOnce: boolean = false;

	/**
	 * Checks whether the hydrated data can be used
	 */
	get canUseHydratedData(): boolean {
		return HYDRATION && hydrationStore.has(this.componentId);
	}

	/**
	 * True if the component is in the context of SSR or hydration
	 */
	get isRelatedToSSR(): boolean {
		return SSR || this.canUseHydratedData;
	}

	/**
	 * A link to an application state object located in `core/component/client-state`.
	 *
	 * This object is used to set any general application parameters. For example, the status of user authorization or
	 * online connection; global sharable application data, etc.
	 *
	 * The way you work with the state object itself is up to you. You can use an API like Redux or just set
	 * properties directly. Note that the state object is observable and can be reactively bond to component templates.
	 */
	@computed({watchable: true})
	get remoteState(): State {
		if (SSR) {
			return {...clientState, ...this.ssrState!};
		}

		return clientState;
	}

	/**
	 * A string value indicating the component initializing status:
	 *
	 *   1. `unloaded` - the component has just been created without any initializing:
	 *      this status may overlap with some component hooks such as `beforeCreate` or `created`.
	 *
	 *   2. `loading` - the component starts loading data from its providers:
	 *      this status may overlap with some component hooks such as `created` or `mounted`.
	 *      If the component has been mounted with this status, you can display this in the component UI.
	 *      For example, by showing a loading indicator.
	 *
	 *   3. `beforeReady` - the component has been fully loaded and has started preparing to render:
	 *      this status may overlap with some component hooks such as `created` or `mounted`.
	 *
	 *   4. `ready` - the component has been fully loaded and rendered: this status may overlap with the `mounted` hook.
	 *
	 *   5. `inactive` - the component is frozen by a keep-alive manager or directly using `activatedProp`:
	 *       this status can overlap with the `deactivated` hook.
	 *
	 *   6. `destroyed` - the component has been destroyed:
	 *      this status may overlap with some component hooks such as `beforeDestroy` or `destroyed`.
	 */
	@computed()
	get componentStatus(): ComponentStatus {
		return this.shadowComponentStatusStore ?? this.field.get<ComponentStatus>('componentStatusStore') ?? 'unloaded';
	}

	/**
	 * Sets a new component status.
	 * Notice, not all statuses cause the component to re-render: `unloaded`, `inactive`, `destroyed`
	 * will only emit events.
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
			this.isFunctional ||

			value === 'ready' && oldValue === 'beforeReady' ||
			value === 'inactive' && !this.renderOnActivation ||

			(<typeof iBlockState>this.instance.constructor).shadowComponentStatuses[value];

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

	/**
	 * True if the current component is completely ready to work.
	 * The `ready` status is mean that the component is mounted and all data providers are loaded.
	 */
	@computed()
	get isReady(): boolean {
		return SSR || Boolean(readyStatuses[this.componentStatus]);
	}

	/** @inheritDoc */
	get hook(): Hook {
		return this.hookStore;
	}

	/**
	 * A string value that specifies in which logical state the component should run.
	 * For instance, depending on this option, the component can render different templates
	 * by separating them with `v-if` directives.
	 *
	 * {@link iBlock.stageProp}
	 */
	@computed()
	get stage(): CanUndef<Stage> {
		return this.field.get('stageStore');
	}

	/**
	 * Sets a new component stage value.
	 * By default, it clears all asynchronous listeners from the `stage.${oldGroup}` group.
	 *
	 * {@link iBlock.stageProp}
	 *
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
	 * A name of the [[Async]] group associated with the `stage` parameter
	 */
	@computed()
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * A link to the application router
	 */
	get router(): CanUndef<bRouter> {
		return this.field.get('routerStore', this.r);
	}

	/**
	 * A link to the active route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	/**
	 * A dictionary with component shadow statuses.
	 * Switching to these states doesn't cause the component to re-render.
	 *
	 * {@link iBlock.componentStatus}
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
		inactive: true,
		destroyed: true,
		unloaded: true
	};

	/**
	 * A string value indicating the component initialize status.
	 * This property stores the statuses that cause the component to re-rendering.
	 *
	 * {@link iBlock.componentStatus}
	 */
	@field({
		unique: true,
		functionalWatching: false
	})

	protected componentStatusStore: ComponentStatus = 'unloaded';

	/**
	 * A string value indicating the component initialize status.
	 * This property stores the statuses that don't cause the component to re-rendering.
	 *
	 * {@link iBlock.componentStatus}
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: ComponentStatus;

	/**
	 * A string value that specifies in which logical state the component should run
	 * {@link iBlock.stageProp}
	 */
	@field({
		functionalWatching: false,
		init: (o) => o.sync.link<CanUndef<Stage>>((val) => {
			o.stage = val;
			return o.field.get('stageStore');
		})
	})

	protected stageStore?: Stage;

	/**
	 * A string value that indicates what lifecycle hook the component is in
	 *
	 * @see https://vuejs.org/guide/essentials/lifecycle.html
	 * {@link iBlock.hook}
	 */
	protected hookStore: Hook = 'beforeRuntime';

	/**
	 * Switches the component to a new lifecycle hook
	 *
	 * @param value
	 * @emits `hook:{$value}(value: Hook, oldValue: Hook)`
	 * @emits `hookChange(value: Hook, oldValue: Hook)
	 */
	// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
	protected set hook(value: Hook) {
		const oldValue = this.hook;
		this.hookStore = value;

		if ('lfc' in this && !this.lfc.isBeforeCreate('beforeDataCreate')) {
			this.emit(`hook:${value}`, value, oldValue);
			this.emit('hookChange', value, oldValue);
		}
	}

	/**
	 * A factory for creating internationalizing function
	 *
	 * @param keysetName - the name of keyset or array with names of keysets to use.
	 *   If passed as an array, the priority of the cases will be arranged in the order of the elements,
	 *   the first one will have the highest priority.
	 *
	 * @param [customLocale] - the locale used to search for translations (the default is taken from
	 *   the application settings)
	 */
	i18n(
		keysetName: CanArray<string>,
		customLocale?: Language
	): (key: string | TemplateStringsArray, params?: I18nParams) => string {
		return i18nFactory(keysetName, customLocale ?? this.remoteState.lang);
	}

	/**
	 * A function for internationalizing texts inside traits.
	 * Because traits are called within the context of components, standard `i18n` does not work,
	 * and you need to explicitly pass the key set name (trait names).
	 *
	 * @param traitName - the trait name
	 * @param text - the text for internationalization
	 * @param [opts] - additional internationalization options
	 */
	i18nTrait(traitName: string, text: string, opts?: I18nParams): string {
		return this.i18n(traitName)(text, opts);
	}

	/**
	 * A function for internationalizing texts
	 */
	get t(): (key: string | TemplateStringsArray, params?: I18nParams) => string {
		return this.i18n(this.componentI18nKeysets);
	}

	/** @inheritDoc */
	getComponentInfo(): Dictionary {
		return {
			name: this.componentName,
			hook: this.hook,
			componentStatus: this.componentStatus
		};
	}

	/**
	 * Returns a promise that will be resolved when the component is switched to the specified component status
	 *
	 * {@link Async.promise}
	 *
	 * @param status
	 * @param [opts] - additional options
	 */
	waitComponentStatus(status: ComponentStatus, opts?: WaitDecoratorOptions): Promise<void>;

	/**
	 * Executes the passed callback when the component is switched to the specified component status.
	 * The method returns a promise resulting from the function call, or the unwrapped raw result if the component is
	 * already in the specified status.
	 *
	 * {@link Async.promise}
	 *
	 * @param status
	 * @param cb
	 * @param [opts] - additional options
	 */
	waitComponentStatus<F extends BoundFn<this>>(
		status: ComponentStatus,
		cb: F,
		opts?: WaitDecoratorOptions
	): CanPromise<ReturnType<F>>;

	waitComponentStatus<F extends BoundFn<this>>(
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
	 * This method works as a two-way connector between the component and its storage.
	 *
	 * While the component is initializing, it requests the storage for its associated data, using the `globalName` prop
	 * as the namespace to search. When the storage is ready to provide data to the component, it passes the data to
	 * this method. After that, the method returns a dictionary associated with the component properties
	 * (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes to each property in this dictionary.
	 * If at least one of  these properties is changed, the entire data batch will be synchronized with the storage
	 * using this method. When the component provides the storage data, the second argument to the method is `'remote'`.
	 *
	 * @param [data] - advanced data
	 * @param [_type] - the call type
	 */
	protected syncStorageState(data?: Dictionary, _type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the storage state.
	 * This method will be used when calling `state.resetStorage`.
	 *
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncStorageState(data),
			state = {};

		if (Object.isDictionary(stateFields)) {
			Object.keys(stateFields).forEach((key) => {
				state[key] = undefined;
			});
		}

		return state;
	}

	/**
	 * This method works as a two-way connector between the component and the application router.
	 *
	 * While the component is initializing, it requests the router for its associated data.
	 * The router provides the data by using this method. After that, the method returns a dictionary associated with
	 * the component properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes to each property in this dictionary.
	 * If at least one of  these properties is changed, the entire data batch will be synchronized with the router
	 * using this method. When the component provides the router data, the second argument to the method is `'remote'`.
	 *
	 * Keep in mind that the router is global to all components, meaning the dictionary this method passes to the router
	 * will extend the current route data, but not override  (`router.push(null, {...route, ...componentData}})`).
	 *
	 * @param [data] - advanced data
	 * @param [_type] - the call type
	 */
	protected syncRouterState(data?: Dictionary, _type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the router state.
	 * This method will be used when calling `state.resetRouter`.
	 *
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncRouterState(data),
			state = {};

		if (Object.isDictionary(stateFields)) {
			Object.keys(stateFields).forEach((key) => {
				state[key] = null;
			});
		}

		return state;
	}

	/**
	 * Takes an object and uses its properties to extend the global object.
	 * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
	 * Using this method, polyfills for all necessary APIs can be passed through.
	 *
	 * @param [env] - an object containing the environment for initialization
	 */
	@hook('beforeCreate')
	protected initGlobalEnv(env: object = this.r): Dictionary {
		return initGlobalEnv(env);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.i18n = i.i18n.bind(this);
		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);
		this.initGlobalEnv = i.initGlobalEnv.bind(this);
	}

	/**
	 * Hook handler: the component is preparing to be destroyed
	 */
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
	}
}
