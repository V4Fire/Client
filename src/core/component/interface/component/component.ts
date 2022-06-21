/*
eslint-disable
@typescript-eslint/no-unused-vars-experimental,
@typescript-eslint/no-empty-function,
@typescript-eslint/unified-signatures
*/

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Async from 'core/async';
import type { BoundFn, ProxyCb } from 'core/async';

import type { Slots, ComponentOptions } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/meta';

import type { Hook } from 'core/component/interface/lc';
import type { ModsProp, ModsDict } from 'core/component/interface/mod';
import type { SyncLinkCache } from 'core/component/interface/link';
import type { RenderEngine } from 'core/component/interface/engine';

import type { ComponentElement } from 'core/component/interface/component/types';
import type { WatchPath, WatchOptions, RawWatchHandler } from 'core/component/interface/watch';
import type { UnsafeGetter, UnsafeComponentInterface } from 'core/component/interface/component/unsafe';

/**
 * An abstract class that represents Vue compatible component API
 */
export abstract class ComponentInterface {
	/**
	 * Type: the root component
	 */
	readonly Root!: ComponentInterface;

	/**
	 * Type: the base super class for all components
	 */
	readonly Component!: ComponentInterface;

	/**
	 * The component string unique identifier
	 */
	readonly componentId!: string;

	/**
	 * The component name without special postfixes like `-functional`
	 */
	readonly componentName!: string;

	/**
	 * A link to the component class instance.
	 * Basically, this parameter is mainly used for `instanceof` checks and to get component default property values.
	 * Mind, all components of the same type refer to the one shareable class instance.
	 */
	readonly instance!: this;

	/**
	 * Additional modifiers for the component.
	 * Modifiers allow binding component state properties directly to CSS classes without
	 * unnecessary re-rendering of a component.
	 */
	abstract readonly modsProp?: ModsProp;

	/**
	 * Shareable component modifiers.
	 * These modifiers are automatically provided to all child components.
	 * So, for example, you have a component that uses another component within your template,
	 * and you specify to the outer component some theme modifier.
	 */
	abstract get shareableMods(): CanUndef<Readonly<ModsDict>>;

	/**
	 * Additional classes for component elements.
	 * This option can be useful if you need to attach some extra classes to the internal component elements.
	 * Be sure you know what you are doing because this mechanism is tied to the private component markup.
	 *
	 * @example
	 * ```js
	 * // Key names are tied with the component elements
	 * // Values contain a CSS class or a list of classes we want to add
	 *
	 * {
	 *   foo: 'bla',
	 *   bar: ['bla', 'baz']
	 * }
	 * ```
	 */
	abstract readonly classes?: Dictionary<CanArray<string>>;

	/**
	 * Additional styles for component elements.
	 * This option can be useful if you need to attach some extra styles to the internal component elements.
	 * Be sure you know what you are doing because this mechanism is tied to the private component markup.
	 *
	 * @example
	 * ```js
	 * // Key names are tied with component elements,
	 * // Values contains a CSS style string, a style object or a list of style strings
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
	 * The active component hook name
	 */
	abstract hook: Hook;

	/**
	 * An API for unsafely invoking of some internal properties of the component.
	 * This parameter allows to avoid TS errors while using protected properties and methods outside from the main class.
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
	 * A dictionary with the initialized component props
	 */
	readonly $props!: Dictionary;

	/**
	 * A link to the root component
	 */
	readonly $root!: this['Root'];

	/**
	 * A link to the component parent
	 */
	readonly $parent?: this['Component'];

	/**
	 * A link to the closest non-functional parent component
	 */
	readonly $normalParent?: this['Component'];

	/**
	 * A link to the component parent if the current component was dynamically created and mounted
	 */
	readonly $remoteParent?: this['Component'];

	/**
	 * An API of the used render engine
	 */
	readonly $renderEngine!: RenderEngine<any>;

	/**
	 * A link to the component meta object.
	 * This object contains all information of the component properties, methods and other stuff.
	 * It's used to create a "real" component by the used render engine.
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * A number that is incremented each time the component is re-rendered
	 */
	protected abstract renderCounter: number;

	/**
	 * A temporary string identifier of the component
	 * (only for functional components)
	 */
	protected readonly $componentId?: string;

	/**
	 * A dictionary with the watchable component properties that can force re-rendering
	 */
	protected readonly $fields!: Dictionary;

	/**
	 * A dictionary with the watchable component properties that can't force re-rendering
	 */
	protected readonly $systemFields!: Dictionary;

	/**
	 * A dictionary with component properties that have been modified and need to be synchronized
	 * (only for functional components)
	 */
	protected readonly $modifiedFields!: Dictionary;

	/**
	 * A dictionary with component attributes that aren't recognized as input properties
	 */
	protected readonly $attrs!: Dictionary<string>;

	/**
	 * A dictionary with references to component elements that have the "ref" attribute
	 */
	protected readonly $refs!: Dictionary;

	/**
	 * A dictionary with handlers that wait appearing of references to elements that have the "ref" attribute
	 */
	protected readonly $refHandlers!: Dictionary<Function[]>;

	/**
	 * A dictionary with available render slots
	 */
	protected readonly $slots!: Slots;

	/**
	 * The active property name to initialize
	 */
	protected readonly $activeField?: string;

	/**
	 * The cache for component links
	 */
	protected readonly $syncLinkCache!: SyncLinkCache;

	/**
	 * An API to tie and control async operations
	 */
	protected readonly async!: Async<ComponentInterface>;

	/**
	 * An API to tie and control async operations
	 * (this parameter is used by a render engine)
	 */
	protected readonly $async!: Async<ComponentInterface>;

	/**
	 * A promise of the component initializing
	 */
	protected $initializer?: Promise<unknown>;

	/**
	 * Activates the component.
	 * The deactivated component won't load data from its providers during initializing.
	 *
	 * Basically, you don't need to think about the component activation,
	 * because it's automatically synchronized with `keep-alive` or the component prop.
	 *
	 * @param [force] - if true, then the component will be forced to activate, even if it's already activated
	 */
	abstract activate(force?: boolean): void;

	/**
	 * Deactivates the component.
	 * The deactivated component won't load data from its providers during initializing.
	 *
	 * Basically, you don't need to think about the component activation,
	 * because it's automatically synchronized with `keep-alive` or the component prop.
	 */
	abstract deactivate(): void;

	/**
	 * Returns a dictionary with information for debugging or logging the component
	 */
	abstract getComponentInfo?(): Dictionary;

	/**
	 * Forces the component to re-render
	 */
	$forceUpdate(): void {}

	/**
	 * Executes the specified function on the next render tick
	 * @param cb
	 */
	$nextTick(cb: Function | BoundFn<this>): void;

	/**
	 * Returns a promise that will be resolved on the next render tick
	 */
	$nextTick(): Promise<void>;
	$nextTick(): CanPromise<void> {}

	/**
	 * Destroys the component
	 */
	protected $destroy(): void {}

	/**
	 * Sets a new reactive value to the specified property of the passed object
	 *
	 * @param object
	 * @param key
	 * @param value
	 */
	protected $set<T = unknown>(object: object, key: unknown, value: T): T {
		return value;
	}

	/**
	 * Deletes the specified reactive property from the passed object
	 *
	 * @param object
	 * @param key
	 */
	protected $delete(object: object, key: unknown): void {}

	/**
	 * Sets a watcher to a component/object property by the specified path
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
	 * Sets a watcher to a component/object property by the specified path
	 *
	 * @param path
	 * @param handler
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param handler
	 */
	protected $watch<T = unknown>(
		obj: object,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Sets a watcher to the specified watchable object
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
		return null;
	}

	/**
	 * Attaches a listener to the specified component event
	 *
	 * @param event
	 * @param handler
	 */
	protected $on<E = unknown, R = unknown>(event: CanArray<string>, handler: ProxyCb<E, R, this>): this {
		return this;
	}

	/**
	 * Attaches a disposable listener to the specified component event
	 *
	 * @param event
	 * @param handler
	 */
	protected $once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>): this {
		return this;
	}

	/**
	 * Detaches the specified event listeners from the component
	 *
	 * @param [event]
	 * @param [handler]
	 */
	protected $off(event?: CanArray<string>, handler?: Function): this {
		return this;
	}

	/**
	 * Emits the specified component event
	 *
	 * @param event
	 * @param args
	 */
	protected $emit(event: string, ...args: unknown[]): this {
		return this;
	}
}
