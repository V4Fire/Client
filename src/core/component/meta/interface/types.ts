/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WatchPath } from 'core/object/watch';

import type { Hook } from 'core/component/interface/life-cycle';
import type { PropOptions, InitFieldFn, MergeFieldFn, UniqueFieldFn } from 'core/component/decorators';
import type { WritableComputedOptions, DirectiveBinding } from 'core/component/engines';

import type { ComponentInterface, FieldWatcher, MethodWatcher } from 'core/component/interface';
import type { ComponentOptions } from 'core/component/meta/interface/options';

export type ComponentInfo = ComponentOptions & {
	name: string;
};

export interface ComponentProp extends PropOptions {
	watchers: Map<string | Function, FieldWatcher>;
	forceDefault?: boolean;
	default?: unknown;
	meta: Dictionary;
}

export interface ComponentSystemField<CTX extends ComponentInterface = ComponentInterface> {
	src: string;
	atom?: boolean;
	default?: unknown;
	unique?: boolean | UniqueFieldFn<CTX>;
	replace?: boolean;
	functional?: boolean;
	functionalWatching?: boolean;
	after?: Set<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta: Dictionary;
}

export interface ComponentField<CTX extends ComponentInterface = ComponentInterface> extends ComponentSystemField<CTX> {
	watchers?: Map<string | Function, FieldWatcher>;
	forceUpdate?: boolean;
}

export interface ComponentComputedField<T = unknown> extends Partial<WritableComputedOptions<T>> {

}

export interface ComponentAccessor<T = unknown> extends Partial<WritableComputedOptions<T>> {
	src: string;
	replace?: boolean;
	functional?: boolean;
	watchable?: boolean;
}

export interface ComponentMethod {
	fn: Function;
	src: string;
	wrapper?: boolean;
	replace?: boolean;
	functional?: boolean;
	watchers?: Dictionary<MethodWatcher>;
	hooks?: ComponentMethodHooks;
}

export interface ComponentHook {
	fn: Function;
	name?: string;
	functional?: boolean;
	once?: boolean;
	after?: Set<string>;
}

export type ComponentHooks = {
	[hook in Hook]: ComponentHook[];
};

export type ComponentMethodHooks = {
	[hook in Hook]?: {
		name: string;
		hook: string;
		after: Set<string>;
	};
};

export interface ComponentDirectiveOptions extends DirectiveBinding {

}

export type ComponentWatchDependencies = Map<WatchPath, WatchPath[]>;
