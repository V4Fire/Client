/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:no-empty
// tslint:disable:typedef

import Async from 'core/async';
import { PARENT } from 'core/component/create/inherit';
import {

	ComponentDriver as Component,
	ComponentOptions,
	FunctionalComponentOptions,
	InjectOptions,
	DirectiveOptions,

	PropOptions as BasePropOptions,
	ComputedOptions,

	WatchOptions,
	WatchOptionsWithHandler,

	CreateElement,
	VNode,
	ScopedSlot

} from 'core/component/engines';

export interface WatchHandler<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(a: A, b: B): unknown;
	(...args: A[]): unknown;
	(ctx: CTX, a: A, b: B): unknown;
	(ctx: CTX, ...args: A[]): unknown;
}

export interface FieldWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	fn: WatchHandler<CTX, A, B>;
	functional?: boolean;
	provideArgs?: boolean;
}

export interface PropOptions extends BasePropOptions {
	functional?: boolean;
}

export interface ComponentProp extends PropOptions {
	watchers: Map<string | Function, FieldWatcher>;
	forceDefault?: boolean;
	default?: unknown;
	meta: Dictionary;
}

export interface InitFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX): unknown;
}

export interface SystemField<CTX extends ComponentInterface = ComponentInterface> {
	src: string;
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;
	replace?: boolean;
	functional?: boolean;
	after?: Set<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta: Dictionary;
}

export interface ComponentField<CTX extends ComponentInterface = ComponentInterface> extends SystemField<CTX> {
	watchers?: Map<string | Function, FieldWatcher>;
}

export interface WatchWrapper<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	(ctx: CTX, handler: WatchHandler<CTX, A, B>): CanPromise<WatchHandler<CTX, A, B> | Function>;
}

export interface WatchObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	join?: boolean | 'replace';
	label?: string | symbol;
	group?: string;
	single?: boolean;
	functional?: boolean;
	options?: AddEventListenerOptions;
	method?: string;
	args?: unknown[];
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
	handler: string | WatchHandler<CTX, A, B>;
}

export interface MethodWatcher<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	field?: string;
	group?: string;
	single?: boolean;
	functional?: boolean;
	options?: AddEventListenerOptions;
	args?: CanArray<unknown>;
	provideArgs?: boolean;
	wrapper?: WatchWrapper<CTX, A, B>;
}

export type Hooks =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
	'created' |
	'beforeMount' |
	'beforeMounted' |
	'mounted' |
	'beforeUpdate' |
	'beforeUpdated' |
	'updated' |
	'beforeActivated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'errorCaptured';

export interface Hook {
	fn: Function;
	name?: string;
	functional?: boolean;
	once?: boolean;
	after?: Set<string>;
}

export interface ComponentMethod {
	fn: Function;
	src: string;
	wrapper?: boolean;
	replace?: boolean;
	functional?: boolean;
	watchers?: Dictionary<MethodWatcher>;
	hooks?: {[hook in Hooks]?: {
		name: string;
		hook: string;
		after: Set<string>;
	}};
}

export interface ComponentAccessor extends ComputedOptions<unknown> {
	src: string;
	replace?: boolean;
	functional?: boolean;
}

export type ModVal = string | boolean | number;
export type StrictModDeclVal = CanArray<ModVal>;
export type ModDeclVal = StrictModDeclVal | typeof PARENT;

export interface ModsDecl {
	[name: string]: Array<ModDeclVal> | void;
}

export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}

export interface ComponentParams {
	name?: string;
	root?: boolean;
	tpl?: boolean;
	functional?: Nullable<boolean> | Dictionary;
	flyweight?: boolean;
	model?: {prop?: string; event?: string};
	parent?: Component;
	provide?: Dictionary | (() => Dictionary);
	inject?: InjectOptions;
	inheritAttrs?: boolean;
	inheritMods?: boolean;
	defaultProps?: boolean;
}

export type RenderFunction =
	ComponentOptions<Component>['render'] |
	FunctionalComponentOptions['render'];

export interface ComponentMeta {
	name: string;
	componentName: string;

	parentMeta?: ComponentMeta;
	constructor: Function;
	instance: Dictionary;
	params: ComponentParams;

	props: Dictionary<ComponentProp>;
	fields: Dictionary<ComponentField>;
	systemFields: Dictionary<ComponentField>;
	mods: ModsDecl;

	computed: Dictionary<ComponentAccessor>;
	accessors: Dictionary<ComponentAccessor>;
	methods: Dictionary<ComponentMethod>;
	watchers: Dictionary<WatchObject[]>;
	hooks: {[H in Hooks]: Hook[]};

	component: {
		name: string;
		mods: Dictionary<string>;
		props: Dictionary<PropOptions>;
		methods: Dictionary<Function>;
		computed: Dictionary<ComputedOptions<unknown>>;
		filters?: Dictionary<Function>;
		directives?: Dictionary<DirectiveOptions>;
		components?: Dictionary<ComponentMeta['component']>;
		staticRenderFns: RenderFunction[];
		render: RenderFunction;
	}
}

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;

export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

export class ComponentInterface<
	C extends ComponentInterface = ComponentInterface<any, any>,
	R extends ComponentInterface = ComponentInterface<any, any>
> {
	readonly componentId!: string;
	readonly componentName!: string;
	readonly globalName?: string;
	readonly instance!: this;
	readonly hook!: Hooks;
	readonly keepAlive!: boolean;
	readonly renderGroup?: string;
	readonly $el!: ComponentElement<C>;
	readonly $options!: ComponentOptions<Component>;
	readonly $props!: Dictionary;
	readonly $children?: C[];
	readonly $parent?: C;
	readonly $normalParent?: C;
	readonly $root!: R | any;
	readonly $isServer!: boolean;
	readonly $isFlyweight?: boolean;
	protected readonly meta!: ComponentMeta;
	protected readonly renderTmp!: Dictionary<VNode>;
	protected readonly $$parent?: C;
	protected readonly $asyncLabel!: symbol;
	protected readonly $async!: Async<ComponentInterface>;
	protected readonly $refs!: Dictionary;
	protected readonly $$refs!: Dictionary<Function[]>;
	protected readonly $slots!: Dictionary<VNode>;
	protected readonly $scopedSlots!: Dictionary<ScopedSlot>;
	protected readonly $data!: Dictionary;
	protected readonly $$data!: Dictionary;
	protected readonly $dataCache!: Dictionary;
	protected readonly $ssrContext!: unknown;
	protected readonly $vnode!: VNode;
	protected readonly $attrs!: Dictionary<string>;
	protected readonly $listeners!: Dictionary<Function | Function[]>;
	protected readonly $activeField?: string;
	protected readonly $syncLinkCache!: SyncLinkCache;
	protected $createElement!: CreateElement;

	protected log?(key: string, ...details: unknown[]): void;

	// @ts-ignore (abstract)
	protected $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
	protected $mount() {}

	protected $forceUpdate(): void {}
	protected $destroy(): void {}

	protected $set<T = unknown>(object: object, key: string, value: T): T;
	protected $set<T = unknown>(array: T[], key: number, value: T): T;
	protected $set() {}

	protected $delete(object: object, key: string): void;
	protected $delete<T = unknown>(array: T[], key: number): void;
	protected $delete() {}

	// @ts-ignore (abstract)
	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		cb: (this: this, n: T, o?: T) => void,
		opts?: WatchOptions
	): Function;

	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $watch() {}

	// @ts-ignore (abstract)
	protected $$watch?<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $$watch() {}

	// @ts-ignore (abstract)
	protected $on(event: CanArray<string>, cb: Function): this;
	protected $on() {}

	// @ts-ignore (abstract)
	protected $once(event: string, cb: Function): this;
	protected $once() {}

	// @ts-ignore (abstract)
	protected $off(event?: CanArray<string>, cb?: Function): this;
	protected $off() {}

	// @ts-ignore (abstract)
	protected $emit(event: string, ...args: unknown[]): this;
	protected $emit() {}

	protected $nextTick(cb: Function | ((this: this) => void)): void;
	// @ts-ignore (abstract)
	protected $nextTick(): Promise<void>;
	protected $nextTick() {}
}
