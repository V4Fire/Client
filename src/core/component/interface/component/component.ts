/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/unified-signatures */

import type Async from 'core/async';
import type { BoundFn, ProxyCb, EventId } from 'core/async';

import type { State } from 'core/component/state';
import type { HydrationStore } from 'core/component/hydration';
import type { VNode, Slots, ComponentOptions, SetupContext, CreateAppFunction } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/meta';

import type { Hook } from 'core/component/interface/lc';
import type { ModsProp, ModsDict } from 'core/component/interface/mod';
import type { SyncLinkCache } from 'core/component/interface/link';
import type { RenderEngine } from 'core/component/interface/engine';

import type { ComponentElement, ComponentEmitterOptions } from 'core/component/interface/component/types';
import type { WatchPath, WatchOptions, RawWatchHandler } from 'core/component/interface/watch';
import type { UnsafeGetter, UnsafeComponentInterface } from 'core/component/interface/component/unsafe';

/**
 * An abstract class that encapsulates the Vue-compatible component API
 */
export abstract class ComponentInterface {
	/**
	 * Type: the root component
	 */
	readonly Root!: ComponentInterface;

	/**
	 * Type: the base superclass for all components
	 */
	readonly Component!: ComponentInterface;

	/**
	 * A link to the application object
	 */
	readonly app!: ReturnType<CreateAppFunction>;

	/**
	 * The unique identifier for the application process
	 */
	readonly appProcessId!: string;

	/**
	 * The unique component identifier.
	 * The value for this prop is automatically generated during the build process,
	 * but it can also be manually specified.
	 * If the prop is not provided, the ID will be generated at runtime.
	 */
	readonly componentIdProp?: string;

	/**
	 * The unique component identifier.
	 * The value is formed based on the passed prop or dynamically.
	 */
	readonly componentId!: string;

	/**
	 * The component name in dash-style without special postfixes like `-functional`
	 */
	readonly componentName!: string;

	/**
	 * A reference to the class instance of the component.
	 * This parameter is primarily used for instance checks and to access default property values of components.
	 * Note that all components of the same type share a single class instance.
	 */
	readonly instance!: this;

	/**
	 * True if the component has been rendered at least once
	 */
	readonly renderedOnce: boolean = false;

	/**
	 * Additional modifiers for the component.
	 * Modifiers allow binding the state properties of a component directly to CSS classes,
	 * without the need for unnecessary re-rendering.
	 */
	abstract readonly modsProp?: ModsProp;

	/**
	 * A dictionary containing applied component modifiers
	 */
	abstract readonly mods: ModsDict;

	/**
	 * The base component modifiers that can be shared with other components.
	 * These modifiers are automatically provided to child components.
	 *
	 * So, for example, you have a component that uses another component in your template,
	 * and you give the outer component some theme modifier. This modifier will be recursively provided to
	 * all child components.
	 */
	abstract get sharedMods(): CanNull<Readonly<ModsDict>>;

	/**
	 * Additional classes for the component elements.
	 * This option can be useful if you need to attach some extra classes to the inner component elements.
	 * Be sure you know what you are doing because this mechanism is tied to the private component markup.
	 *
	 * @example
	 * ```js
	 * // Key names are tied with the component elements
	 * // Values contain CSS classes we want to add
	 *
	 * const classes = {
	 *   foo: 'bla',
	 *   bar: ['bla', 'baz']
	 * };
	 * ```
	 */
	abstract readonly classes?: Dictionary<CanArray<string>>;

	/**
	 * Additional styles for the component elements.
	 * This option can be useful if you need to attach some extra styles to the inner component elements.
	 * Be sure you know what you are doing because this mechanism is tied to the private component markup.
	 *
	 * @example
	 * ```js
	 * // Key names are tied with component elements,
	 * // Values contains CSS styles we want to add
	 *
	 * const styles = {
	 *   foo: 'color: red',
	 *   bar: {color: 'blue'},
	 *   baz: ['color: red', 'background: green']
	 * };
	 * ```
	 */
	abstract readonly styles?: Dictionary<CanArray<string> | Dictionary<string>>;

	/**
	 * The getter is used to retrieve the root component.
	 * It is commonly used for dynamically mounting components.
	 */
	abstract readonly getRoot?: () => this['Root'];

	/**
	 * The getter is used to retrieve the parent component.
	 * It is commonly used for dynamically mounting components.
	 */
	abstract readonly getParent?: () => this['$parent'];

	/**
	 * A string value indicating the lifecycle hook that the component is currently in.
	 * For instance, `created`, `mounted` or `destroyed`.
	 *
	 * @see https://vuejs.org/guide/essentials/lifecycle.html
	 */
	abstract hook: Hook;

	/**
	 * A link to the root component
	 */
	get r(): this['Root'] {
		return Object.throw();
	}

	/**
	 * An API for safely invoking some internal properties and methods of a component.
	 * This parameter allows you to use protected properties and methods from outside the class without
	 * causing TypeScript errors.
	 * Use it when you need to decompose the component class into a composition of friendly classes.
	 */
	get unsafe(): UnsafeGetter<UnsafeComponentInterface<this>> {
		return Object.cast(this);
	}

	/**
	 * A link to the component root element
	 */
	readonly $el?: ComponentElement<this['Component']>;

	/**
	 * Raw options of the component with which it was created by an engine
	 */
	readonly $options!: ComponentOptions;

	/**
	 * A dictionary containing the initialized component props
	 */
	readonly $props!: Dictionary;

	/**
	 * A link to the root component
	 */
	readonly $root!: this['Root'];

	/**
	 * A link to the parent component
	 */
	readonly $parent!: this['Component'] | null;

	/**
	 * A link to the closest non-functional parent component
	 */
	readonly $normalParent!: this['Component'] | null;

	/**
	 * A link to the parent component if the current component was dynamically created and mounted
	 */
	readonly $remoteParent?: this['Component'];

	/**
	 * A list of child components
	 */
	readonly $children!: Array<this['Component']>;

	/**
	 * An API of the used render engine
	 */
	readonly $renderEngine!: RenderEngine<any>;

	/**
	 * A link to the component metaobject.
	 * This object contains all information of the component properties, methods, etc.
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * Hydrated data repository.
	 * This API is used only for SSR.
	 */
	protected readonly hydrationStore?: HydrationStore;

	/**
	 * The global state with which the SSR rendering process is initialized.
	 * This API is used only for SSR.
	 */
	protected readonly ssrState?: State;

	/**
	 * A dictionary containing component attributes that are not identified as input properties
	 */
	protected readonly $attrs!: Dictionary<string>;

	/**
	 * A dictionary containing the watchable component fields that can trigger a re-rendering of the component
	 */
	protected readonly $fields!: Dictionary;

	/**
	 * A dictionary containing the watchable component fields that do not cause a re-rendering of
	 * the component when they change
	 */
	protected readonly $systemFields!: Dictionary;

	/**
	 * A dictionary containing component properties that have undergone modifications and require synchronization
	 * (applicable only to functional components)
	 */
	protected readonly $modifiedFields!: Dictionary;

	/**
	 * The name of the component's field being initialized at the current moment
	 */
	protected readonly $activeField?: string;

	/**
	 * A number that increments every time the component is re-rendered
	 */
	protected readonly $renderCounter!: number;

	/**
	 * A dictionary containing references to component elements with the "ref" attribute
	 */
	protected readonly $refs!: Dictionary;

	/**
	 * A dictionary containing available render slots
	 */
	protected readonly $slots!: Slots;

	/**
	 * The cache dedicated to component links
	 */
	protected readonly $syncLinkCache!: SyncLinkCache;

	/**
	 * An API for binding and managing asynchronous operations
	 */
	protected readonly async!: Async<ComponentInterface>;

	/**
	 * An API for binding and managing asynchronous operations.
	 * This property is used by restricted/private consumers, such as private directives or component engines.
	 */
	protected readonly $async!: Async<ComponentInterface>;

	/**
	 * A promise that resolves when the component is initialized.
	 * This property is used during SSR for rendering the component.
	 */
	protected $initializer?: Promise<unknown>;

	/**
	 * Activates the component.
	 * A deactivated component will not load data from its providers during initialization.
	 *
	 * Generally, you don't need to consider component activation,
	 * as it is automatically synchronized with the `keep-alive` feature or the respective component property.
	 *
	 * @param [force] - If set to true, the component will undergo forced activation, even if it is already activated
	 */
	abstract activate(force?: boolean): void;

	/**
	 * Deactivates the component.
	 * A deactivated component will not load data from its providers during initialization.
	 *
	 * Generally, you don't need to consider component activation,
	 * as it is automatically synchronized with the keep-alive feature or the respective component property
	 */
	abstract deactivate(): void;

	/**
	 * Returns a dictionary containing information about the component, useful for debugging or logging purposes
	 */
	abstract getComponentInfo?(): Dictionary;

	/**
	 * The component render function
	 *
	 * @param _ctx
	 * @param _cache
	 */
	render(_ctx: ComponentInterface, _cache: unknown[]): VNode {
		return Object.throw();
	}

	/**
	 * Initiates a forced re-render of the component
	 */
	$forceUpdate(): void {
		return Object.throw();
	}

	/**
	 * Runs the specified function during the next render tick
	 * @param cb
	 */
	$nextTick(cb: Function | BoundFn<this>): void;

	/**
	 * Returns a promise that resolves during the next render tick
	 */
	$nextTick(): Promise<void>;

	$nextTick(): CanPromise<void> {
		return Object.throw();
	}

	/**
	 * Initializes the component.
	 * This method accepts input parameters and an initialization context,
	 * and can return an object containing additional fields and methods for the component.
	 * If the method returns a Promise, the component will not be rendered until it is resolved.
	 * This method only works for non-functional components.
	 *
	 * @param props
	 * @param ctx
	 */
	protected abstract setup(props: Dictionary, ctx: SetupContext): CanPromise<CanUndef<Dictionary>>;

	/**
	 * Destroys the component
	 * @param [_recursive] - if set to false, the destructor will be executed for the component itself,
	 *   but not for its descendants
	 */
	protected $destroy(_recursive: boolean = true): void {
		return Object.throw();
	}

	/**
	 * Assigns a new reactive value to the specified property of the given object
	 *
	 * @param _object
	 * @param _key
	 * @param _value
	 */
	protected $set<T = unknown>(_object: object, _key: unknown, _value: T): T {
		return Object.throw();
	}

	/**
	 * Removes the specified reactive property from the given object
	 *
	 * @param _object
	 * @param _key
	 */
	protected $delete(_object: object, _key: unknown): void {
		Object.throw();
	}

	/**
	 * Establishes a watcher for a component/object property using the specified path
	 *
	 * @param path
	 * @param handler
	 * @param opts
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		opts: WatchOptions,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Establishes a watcher for a component/object property using the specified path
	 *
	 * @param path
	 * @param handler
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Establishes a watcher for a watchable object
	 *
	 * @param obj
	 * @param handler
	 */
	protected $watch<T = unknown>(
		obj: object,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Establishes a watcher for a watchable object
	 *
	 * @param obj
	 * @param handler
	 * @param opts
	 */
	protected $watch<T = unknown>(
		obj: object,
		opts: WatchOptions,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	protected $watch(): Nullable<Function> {
		return Object.throw();
	}

	/**
	 * Attaches a listener to the specified component's event
	 *
	 * @param event
	 * @param handler
	 * @param [opts]
	 */
	protected $on<E = unknown, R = unknown>(
		event: string,
		handler: ProxyCb<E, R, this>,
		opts?: ComponentEmitterOptions
	): EventId;

	/**
	 * Attaches a listener to the specified component's events
	 *
	 * @param events
	 * @param handler
	 * @param [opts]
	 */
	protected $on<E = unknown, R = unknown>(
		events: string[],
		handler: ProxyCb<E, R, this>,
		opts?: ComponentEmitterOptions
	): EventId[];

	protected $on<E = unknown, R = unknown>(
		_event: CanArray<string>,
		_handler: ProxyCb<E, R, this>,
		_opts?: ComponentEmitterOptions
	): CanArray<EventId> {
		return Object.throw();
	}

	/**
	 * Attaches a disposable listener to the specified component's event
	 *
	 * @param event
	 * @param handler
	 * @param [opts]
	 */
	protected $once<E = unknown, R = unknown>(
		event: string,
		handler: ProxyCb<E, R, this>,
		opts?: ComponentEmitterOptions
	): EventId;

	/**
	 * Attaches a disposable listener to the specified component's event
	 *
	 * @param events
	 * @param handler
	 * @param opts
	 */
	protected $once<E = unknown, R = unknown>(
		events: string[],
		handler: ProxyCb<E, R, this>,
		opts?: ComponentEmitterOptions
	): EventId[];

	protected $once<E = unknown, R = unknown>(
		_event: CanArray<string>,
		_handler: ProxyCb<E, R, this>,
		_opts?: ComponentEmitterOptions
	): CanArray<EventId> {
		return Object.throw();
	}

	/**
	 * Detaches the specified event listeners from the component
	 * @param [link]
	 */
	protected $off(link: CanArray<EventId>): this;

	/**
	 * Detaches the specified event listeners from the component
	 *
	 * @param [event]
	 * @param [handler]
	 */
	protected $off(event?: CanArray<string>, handler?: Function): this;

	protected $off(_event?: CanArray<string | EventId>, _handler?: Function): this {
		return Object.throw();
	}

	/**
	 * Emits the specified component event
	 *
	 * @param _event
	 * @param _args
	 */
	protected $emit(_event: string, ..._args: unknown[]): this {
		return Object.throw();
	}

	/**
	 * Resolves the specified `ref` attribute
	 * @param _ref
	 */
	protected $resolveRef(_ref: Function): Function;
	protected $resolveRef(_ref: null | undefined): undefined;
	protected $resolveRef(_ref: unknown): string;
	protected $resolveRef(_ref: unknown): CanUndef<string | Function> {
		return Object.throw();
	}

	/**
	 * Returns a function for getting the root component based on the context of the current component
	 * @param _ctx
	 */
	protected $getRoot(_ctx: ComponentInterface): () => ComponentInterface {
		return Object.throw();
	}

	/**
	 * Returns a function for getting the parent component based on the context of the current component
	 *
	 * @param _ctx
	 * @param _restArgs
	 */
	protected $getParent(
		_ctx: ComponentInterface,
		_restArgs?: {ctx?: ComponentInterface} | VNode
	): () => ComponentInterface {
		return Object.throw();
	}

	/**
	 * Executes the given function within the component's render context.
	 * This function is necessary to render components asynchronously.
	 *
	 * @param _cb
	 */
	protected $withCtx<T>(_cb: (...args: any) => T): T {
		return Object.throw();
	}
}
