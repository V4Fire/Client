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
import type { Theme } from 'core/theme-manager';

import { i18nFactory } from 'core/i18n';
import { styles as hydratedStyles } from 'core/hydration-store';

import { component, app, Hook, State } from 'core/component';
import type bRouter from 'components/base/b-router/b-router';

import type { Module } from 'components/friends/module-loader';
import type { ConverterCallType } from 'components/friends/state';

import { readyStatuses } from 'components/super/i-block/modules/activation';
import { field, system, computed, wait, hook, WaitDecoratorOptions } from 'components/super/i-block/decorators';

import type iBlock from 'components/super/i-block/i-block';
import type { Stage, ComponentStatus, ComponentStatuses } from 'components/super/i-block/interface';

import iBlockMods from 'components/super/i-block/mods';

@component({partial: 'iBlock'})
export default abstract class iBlockState extends iBlockMods {
	/**
	 * A list of additional dependencies to load during the component's initialization
	 * {@link iBlock.dependenciesProp}
	 */
	@system((o) => o.sync.link((val?: Iterable<Module>) => val == null ? [] : [...val]))
	dependencies!: Module[];

	/**
	 * This is true if the component has been in the `ready` state at least once
	 */
	@system({unique: true})
	isReadyOnce: boolean = false;

	/**
	 * A dictionary with component shadow statuses.
	 * Switching to these states doesn't trigger the component to re-render.
	 *
	 * {@link iBlock.componentStatus}
	 */
	static readonly shadowComponentStatuses: ComponentStatuses = {
		inactive: true,
		destroyed: true,
		unloaded: true
	};

	/**
	 * Checks whether the hydrated data can be used
	 */
	get canUseHydratedData(): boolean {
		return HYDRATION && this.remoteState.hydrationStore.has(this.componentId);
	}

	/**
	 * True if the component is in the context of SSR or hydration
	 */
	get isRelatedToSSR(): boolean {
		return SSR || this.canUseHydratedData;
	}

	/**
	 * If set to false, the component will not render its content during SSR.
	 *
	 * In a hydration context, the field value is determined by the value of the `renderOnHydration` flag, which
	 * is stored in a `hydrationStore` during SSR for components that have the `ssrRenderingProp` value set to false.
	 * In other cases, the field value is derived from the `ssrRenderingProp` property.
	 */
	@field((o) => {
		if (HYDRATION) {
			const store = o.remoteState.hydrationStore.get(o.componentId);
			return !Boolean(store?.renderOnHydration);
		}

		return o.ssrRenderingProp;
	})

	protected ssrRendering!: boolean;

	/**
	 * A link to the global state of the application.
	 * The state interface is described in the `core/component/state` module.
	 *
	 * The state object provides multiple APIs for interacting with the application environment,
	 * for example, the location or session modules.
	 *
	 * Also, you can extend this object with any necessary properties.
	 * Please note that the state object is observable and can be reactively bound to component templates.
	 */
	@computed({watchable: true})
	get remoteState(): State {
		if ('app' in this) {
			return this.app.state;
		}

		if ('_remoteState' in this) {
			return this['_remoteState'];
		}

		// If this getter is called on the root component at the beforeCreate stage,
		// the app property is simply not there yet.
		// So we take it from the global one,
		// but since it can change later during SSR, we cache it on the component.
		const state = app.state!;

		Object.defineProperty(this, '_remoteState', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: state
		});

		return state;
	}

	/**
	 * An API for working with the target document's URL
	 */
	@computed({cache: 'forever'})
	get location(): URL {
		return this.remoteState.location;
	}

	/**
	 * A string value indicating the initialization status of the component:
	 *
	 *   1. `unloaded` - the component has been just created without any initialization:
	 *      this status might coincide with certain component hooks such as `beforeCreate` or `created`.
	 *
	 *   2. `loading` - the component begins its data loading process from providers:
	 *      this status might coincide with certain component hooks such as `created` or `mounted`.
	 *      If the component gets mounted with this status,
	 *      it can be reflected in the component's UI, for instance, by displaying a loading indicator.
	 *
	 *   3. `beforeReady` - the component has fully loaded and is starting to prepare for rendering:
	 *      this status might coincide with certain component hooks such as created or mounted.
	 *
	 *   4. `ready` - the component has been completely loaded and rendered:
	 *      this status might coincide with the mounted hook.
	 *
	 *   5. `inactive` - the component is in a dormant state,
	 *      made so by a keep-alive manager or directly through an `activatedProp`:
	 *      this status might coincide with the `deactivated` hook.
	 *
	 *   6. `destroyed` - the component has been destroyed:
	 *      this status might coincide with certain component hooks such as `beforeDestroy` or `destroyed`.
	 */
	@computed()
	get componentStatus(): ComponentStatus {
		return this.shadowComponentStatusStore ?? this.field.get<ComponentStatus>('componentStatusStore') ?? 'unloaded';
	}

	/**
	 * Sets a new status for the component.
	 * Note that not all statuses will trigger the component to re-render:
	 * statuses such as `unloaded`, `inactive`, and `destroyed` will only emit events.
	 *
	 * @param value
	 * @emits `componentStatus:{$value}(value: ComponentStatus, oldValue: ComponentStatus)`
	 * @emits `componentStatusChange(value: ComponentStatus, oldValue: ComponentStatus)`
	 */
	set componentStatus(value: ComponentStatus) {
		const oldValue = this.componentStatus;

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

	// eslint-disable-next-line jsdoc/require-param
	/**
	 * A function for text internationalization in the context of this component.
	 * This function can also be used as a string tag.
	 * For more information, read the documentation of the `core/i18n` module.
	 *
	 * @example
	 * ```js
	 * console.log(this.t`Hello world!`);
	 * ```
	 */
	get t(): (key: string | TemplateStringsArray, params?: I18nParams) => string {
		return this.i18n(this.componentI18nKeysets);
	}

	/**
	 * True if the current component is fully prepared to function.
	 * The `ready` status means that the component is mounted and all data providers have been loaded.
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
	 * A string value specifying the logic state in which the component should operate.
	 * For instance, depending on this option, the component may render different templates
	 * by distinguishing them with the `v-if` directive.
	 *
	 * {@link iBlock.stageProp}
	 */
	@computed()
	get stage(): CanUndef<Stage> {
		return this.field.get('stageStore');
	}

	/**
	 * Sets a new stage value for the component.
	 * By default, it clears all asynchronous listeners from the `stage.${oldGroup}` group.
	 *
	 * {@link iBlock.stageProp}
	 *
	 * @emits `stage:${value}(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 * @emits `stageChange(value: CanUndef<Stage>, oldValue: CanUndef<Stage>)`
	 */
	set stage(value: CanUndef<Stage>) {
		const oldValue = this.stage;

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
	 * A link to the current route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	/**
	 * A string value indicating the initialization status of the component.
	 * This property stores the statuses that trigger the component to re-render.
	 *
	 * {@link iBlock.componentStatus}
	 */
	@field({
		unique: true,
		functionalWatching: false
	})

	protected componentStatusStore: ComponentStatus = 'unloaded';

	/**
	 * A string value indicating the initialization status of the component.
	 * This property stores the statuses that do not trigger the component to re-render.
	 *
	 * {@link iBlock.componentStatus}
	 */
	@system({unique: true})
	protected shadowComponentStatusStore?: ComponentStatus;

	/**
	 * A string value specifying the logical state in which the component should operate
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
	 * A string value indicating which lifecycle hook the component is currently in
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
	 * @param keysetName - the name of the keyset or an array with names of keysets to use.
	 *   If passed as an array, the priority of the cases will follow the order of the elements,
	 *   with the first one having the highest priority.
	 *
	 * @param [customLocale] - the locale used to search for translations (the default is taken from
	 *   the application state)
	 */
	i18n(keysetName: CanArray<string>, customLocale?: Language): ReturnType<typeof i18nFactory> {
		return i18nFactory(keysetName, customLocale ?? this.remoteState.locale);
	}

	/**
	 * A function aimed at internationalizing texts within traits.
	 * Since traits are invoked within the context of components, the standard `i18n` does not operate,
	 * requiring the explicit passing of the key set name (trait names).
	 *
	 * @param traitName - the name of the trait
	 * @param text - the text to be internationalized
	 * @param [opts] - additional internationalization options
	 */
	i18nTrait(traitName: string, text: string, opts?: I18nParams): string {
		return this.i18n(traitName)(text, opts);
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
	 * Returns a promise that will be resolved when the component transitions to the specified component status
	 * {@link Async.promise}
	 *
	 * @param status
	 * @param [opts] - additional options
	 */
	waitComponentStatus(status: ComponentStatus, opts?: WaitDecoratorOptions): Promise<void>;

	/**
	 * Executes the passed callback when the component transitions to the specified component status.
	 * The method returns a promise resulting from the callback function invocation,
	 * or the unwrapped raw result if the component is already in the targeted status.
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
		let cb: CanUndef<AnyFunction>;

		if (Object.isFunction(cbOrOpts)) {
			cb = cbOrOpts;

		} else {
			opts = cbOrOpts;
		}

		opts = {...opts, join: false};

		if (Object.isFunction(cb)) {
			return wait(status, {...opts, fn: cb}).call(this);
		}

		let isResolved = false;

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
	 * Hydrates the component styles for SSR
	 * @param [componentName]
	 */
	@hook('created')
	hydrateStyles(componentName: string = this.componentName): void {
		if (!SSR || !HYDRATION) {
			return;
		}

		const stylesToHydrate = hydratedStyles.get(componentName);

		if (stylesToHydrate != null) {
			this.remoteState.hydrationStore.styles.set(componentName, stylesToHydrate);
		}
	}

	/**
	 * This method serves as a two-way connector between the component and its storage.
	 *
	 * During the component's initialization, it requests its associated data from the storage,
	 * using the `globalName` prop as the namespace for the search.
	 * When the storage is ready to supply the data to the component, it passes the data to this method.
	 * Consequently, the method returns a dictionary associated with the component properties
	 * (complex paths with dots can be specified, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Moreover, the component will monitor changes to each property in this dictionary.
	 * If at least one of these properties changes, the entire data batch gets synchronized with
	 * the storage using this method.
	 * When the component delivers the storage data, the second argument to the method is `'remote'`.
	 *
	 * @param [data] - additional data
	 * @param [_type] - the call type
	 */
	protected syncStorageState(data?: Dictionary, _type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the storage state.
	 * This method will be used when calling `state.resetStorage`.
	 *
	 * @param [data] - additional data
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
	 * This method serves as a two-way connector between the component and the application router.
	 *
	 * During the component's initialization, it requests its associated data from the router.
	 * The router delivers the data by using this method.
	 * Following this, the method returns a dictionary associated with the component properties
	 * (you can specify a complex path with dots, such as `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Moreover, the component will monitor changes to each property within this dictionary.
	 * If at least one of these properties changes,
	 * the entire data batch is synchronized with the router using this method.
	 * When the component supplies the data to the router, the second argument to the method is `'remote'`.
	 *
	 * Keep in mind that the router is global to all components.
	 * This means the dictionary passed to the router by this method will extend the existing route data,
	 * but not override it (`router.push(null, {...route, ...componentData})`).
	 *
	 * @param [data] - additional data
	 * @param [_type] - the call type
	 */
	protected syncRouterState(data?: Dictionary, _type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the router state.
	 * This method will be used when calling `state.resetRouter`.
	 *
	 * @param [data] - additional data
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

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const i = this.instance;

		this.i18n = i.i18n.bind(this);
		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);
	}

	/**
	 * Initializes the theme modifier and attaches a listener to monitor changes of the theme
	 */
	@hook('created')
	protected initThemeModListener(): void {
		const theme = this.remoteState.theme.get();
		void this.setMod('theme', theme.value);

		this.async.on(
			this.remoteState.theme.emitter,
			'theme.change',
			(theme: Theme) => this.setMod('theme', theme.value)
		);
	}

	/**
	 * Stores a boolean flag in the hydrationStore during SSR,
	 * which determines whether the content of components should be rendered during hydration
	 * if server-side rendering is disabled for the component
	 */
	@hook('created')
	protected storeRenderOnHydration(): void {
		if (SSR && !this.ssrRendering) {
			this.remoteState.hydrationStore.set(this.componentId, 'renderOnHydration', true);
		}
	}

	/**
	 * Allows content to be rendered if the component is in a hydration context,
	 * and server-side rendering has been disabled for the component using the `ssrRenderingProp` property
	 */
	@hook('mounted')
	protected async shouldRenderOnHydration(): Promise<void> {
		if (HYDRATION && !this.ssrRendering) {
			await this.nextTick();
			this.ssrRendering = true;
		}
	}

	/**
	 * Hook handler: the component is preparing to be destroyed
	 */
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';
	}
}
