/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath } from 'core/object/watch';

import type { WritableComputedOptions, DirectiveBinding } from 'core/component/engines';
import type { PropOptions, InitFieldFn, MergeFieldFn, UniqueFieldFn } from 'core/component/decorators';

import type { ComponentInterface, FieldWatcher, MethodWatcher, Hook } from 'core/component/interface';

export interface ComponentProp extends PropOptions {
	forceUpdate: boolean;
	forceDefault?: boolean;
	watchers?: Map<string | Function, FieldWatcher>;
	default?: unknown;
	meta: Dictionary;
}

export interface ComponentSystemField<CTX extends ComponentInterface = ComponentInterface> {
	src: string;
	meta: Dictionary;

	atom?: boolean;
	after?: Set<string>;

	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;

	functional?: boolean;
	functionalWatching?: boolean;

	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
}

export interface ComponentField<CTX extends ComponentInterface = ComponentInterface> extends ComponentSystemField<CTX> {
	forceUpdate?: boolean;
	watchers?: Map<string | Function, FieldWatcher>;
}

export type ComponentAccessorCacheType =
	boolean |
	'auto';

export interface ComponentAccessor<T = unknown> extends Partial<WritableComputedOptions<T>> {
	src: string;
	cache: ComponentAccessorCacheType;

	functional?: boolean;
	watchable?: boolean;

	dependencies?: WatchPath[];
	tiedWith?: ComponentProp | ComponentField;
}

export interface ComponentMethod {
	fn: Function;

	src?: string;
	wrapper?: boolean;
	functional?: boolean;

	watchers?: Dictionary<MethodWatcher>;
	hooks?: ComponentMethodHooks;
}

export interface ComponentHook {
	fn: Function;

	name?: string;
	after?: Set<string>;

	functional?: boolean;
	once?: boolean;
}

export type ComponentHooks = {
	[hook in Hook]: ComponentHook[];
};

export type ComponentMethodHooks = {
	[hook in Hook]?: {
		name: string;
		hook: string;
		functional?: boolean;
		after?: Set<string>;
	};
};

export interface ComponentDirectiveOptions extends DirectiveBinding {}

export type ComponentWatchDependencies = Map<WatchPath, WatchPath[]>;
export type ComponentWatchPropDependencies = Map<WatchPath, Set<string>>;
