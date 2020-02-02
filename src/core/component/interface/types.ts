/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:no-empty
// tslint:disable:typedef

import { PARENT } from 'core/component/const';
import { ComponentInterface } from 'core/component/interface/component';

import {

	ComponentDriver as Component,
	ComponentOptions,

	FunctionalComponentOptions,
	PropOptions as BasePropOptions,

	ComputedOptions,
	WatchOptions

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

export type RenderFunction =
	ComponentOptions<Component>['render'] |
	FunctionalComponentOptions['render'];

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;
