/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/unified-signatures */

import type Async from 'core/async';
import type { BoundFn, ProxyCb } from 'core/async';

import type { VNode, Slots, ComponentOptions } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/meta';

import type { Hook } from 'core/component/interface/lc';
import type { ModsProp, ModsDict } from 'core/component/interface/mod';
import type { SyncLinkCache } from 'core/component/interface/link';
import type { RenderEngine } from 'core/component/interface/engine';

import type { ComponentElement } from 'core/component/interface/component/types';
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
	 * The unique component identifier
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
	 * Shareable component modifiers.
	 * These modifiers are automatically propagated to child components.
	 * For instance, suppose you have a component in your template that utilizes another component,
	 * and you assign a theme modifier to the outer component.
	 */
	abstract get sharedMods(): CanUndef<Readonly<ModsDict>>;

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
	 * {
	 *   foo: 'bla',
	 *   bar: ['bla', 'baz']
	 * }
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
	 * {
	 *   foo: 'color: red',
	 *   bar: {color: 'blue'},
	 *   baz: ['color: red', 'background: green']
	 * }
	 * ```
	 */
	abstract readonly styles?: Dictionary<CanArray<string> | Dictionary<string>>;

	/**
	 * A string value indicating the lifecycle hook that the component is currently in.
	 * For instance, `created`, `mounted` or `destroyed`.
	 *
	 * @see https://vuejs.org/guide/essentials/lifecycle.html
	 */
	abstract hook: Hook;

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
	 * Destroys the component
	 */
	protected $destroy(): void {
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
	 * @param _event
	 * @param _handler
	 */
	protected $on<E = unknown, R = unknown>(_event: CanArray<string>, _handler: ProxyCb<E, R, this>): this {
		return Object.throw();
	}

	/**
	 * Attaches a disposable listener to the specified component's event
	 *
	 * @param _event
	 * @param _handler
	 */
	protected $once<E = unknown, R = unknown>(_event: string, _handler: ProxyCb<E, R, this>): this {
		return Object.throw();
	}

	/**
	 * Detaches the specified event listeners from the component
	 *
	 * @param [_event]
	 * @param [_handler]
	 */
	protected $off(_event?: CanArray<string>, _handler?: Function): this {
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
	 * Executes the given function within the component's render context.
	 * This function is necessary to render components asynchronously.
	 *
	 * @param _cb
	 */
	protected $withCtx<T>(_cb: (...args: any) => T): T {
		return Object.throw();
	}
}
