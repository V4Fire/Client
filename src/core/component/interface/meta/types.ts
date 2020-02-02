/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface/component';
import { ComponentDriver, ComputedOptions, DirectiveOptions } from 'core/component/engines';
import { FieldWatcher, MethodWatcher } from 'core/component/interface/watch';
import { PropOptions, Hook, InitFieldFn, MergeFieldFn, UniqueFieldFn } from 'core/component/interface/other';

export interface ComponentModel {
	prop?: string;
	event?: string;
}

export interface ComponentParams {
	name?: string;
	root?: boolean;
	tpl?: boolean;

	functional?: Nullable<boolean> | Dictionary;
	flyweight?: boolean;

	model?: ComponentModel;
	parent?: ComponentDriver;

	inheritAttrs?: boolean;
	inheritMods?: boolean;
	defaultProps?: boolean;
}

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
	after?: Set<string>;
	init?: InitFieldFn<CTX>;
	merge?: MergeFieldFn<CTX> | boolean;
	meta: Dictionary;
}

export interface ComponentField<CTX extends ComponentInterface = ComponentInterface> extends ComponentSystemField<CTX> {
	watchers?: Map<string | Function, FieldWatcher>;
}

export interface ComponentComputedField<T = unknown> extends ComputedOptions<T> {

}

export interface ComponentAccessor<T = unknown> extends ComputedOptions<T> {
	src: string;
	replace?: boolean;
	functional?: boolean;
}

export interface ComponentHook {
	fn: Function;
	name?: string;
	functional?: boolean;
	once?: boolean;
	after?: Set<string>;
}

export type ComponentHooks = {
	[H in Hook]: ComponentHook[];
};

export type ComponentMethodHooks = {
	[hook in Hook]?: {
		name: string;
		hook: string;
		after: Set<string>;
	};
};

export interface ComponentMethod {
	fn: Function;
	src: string;
	wrapper?: boolean;
	replace?: boolean;
	functional?: boolean;
	watchers?: Dictionary<MethodWatcher>;
	hooks?: ComponentMethodHooks;
}

export interface ComponentDirectiveOptions extends DirectiveOptions {

}
