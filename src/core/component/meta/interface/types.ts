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
import { PropOptions, Hook, InitFieldFn, MergeFieldFn, UniqueFieldFn } from 'core/component/interface';

export interface ComponentModel {
	prop?: string;
	event?: string;
}

export interface ComponentOptions {
	/**
	 * Component name
	 */
	name?: string;

	/**
	 * If true, then the component is registered as root
	 * @default `false`
	 */
	root?: boolean;

	/**
	 * If false, then the component uses the default template
	 * @default `true`
	 */
	tpl?: boolean;

	/**
	 * Functional mode:
	 * * if true, then the component will be created as a functional component
	 * * if an object with parameters, then the component will be created as a smart component
	 *
	 * @default `false`
	 */
	functional?: Nullable<boolean> | Dictionary;

	/**
	 * If true, then the component can be used as a flyweight component
	 * @default `false`
	 */
	flyweight?: boolean;

	/**
	 * Parameters for a model option
	 */
	model?: ComponentModel;

	/**
	 * Link to a parent component
	 */
	parent?: ComponentDriver;

	inheritAttrs?: boolean;
	inheritMods?: boolean;
	defaultProps?: boolean;
}

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
	[hook in Hook]: ComponentHook[];
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
