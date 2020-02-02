/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ComponentInterface from 'core/component/interface/component';
import { ComponentDriver, ComputedOptions } from 'core/component/engines';
import { PropOptions, FieldWatcher, MethodWatcher, SystemField, Hooks } from 'core/component/interface/types';

export interface ComponentParams {
	name?: string;
	root?: boolean;
	tpl?: boolean;

	functional?: Nullable<boolean> | Dictionary;
	flyweight?: boolean;

	model?: {prop?: string; event?: string};
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

export interface ComponentAccessor extends ComputedOptions<unknown> {
	src: string;
	replace?: boolean;
	functional?: boolean;
}

export interface ComponentField<CTX extends ComponentInterface = ComponentInterface> extends SystemField<CTX> {
	watchers?: Map<string | Function, FieldWatcher>;
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

export type ComponentElement<T = unknown> = Element & {
	component?: T;
};
