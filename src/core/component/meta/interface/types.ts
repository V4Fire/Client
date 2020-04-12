/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchPath } from 'core/object/watch';
import { ComponentInterface } from 'core/component/interface/component';
import { ComputedOptions, DirectiveOptions } from 'core/component/engines';
import { FieldWatcher, MethodWatcher } from 'core/component/interface/watch';
import { PropOptions, Hook, InitFieldFn, MergeFieldFn, UniqueFieldFn } from 'core/component/interface';

/**
 * Additional options to register a component
 */
export interface ComponentOptions {
	/**
	 * Component name.
	 * If the name isn't specified, it will be taken from a class name by using reflection.
	 * This parameter can't be inherited from a parent.
	 *
	 * @example
	 * ```typescript
	 * // name == 'bExample'
	 * @component({name: 'bExample'})
	 * class Foo extends iBlock {
	 *
	 * }
	 *
	 * // name == 'Bar'
	 * @component()
	 * class Bar extends iBlock {
	 *
	 * }
	 * ```
	 */
	name?: string;

	/**
	 * If true, then the component is registered as a root component.
	 *
	 * The root component is the top of components hierarchy, i.e it contains all components in an application,
	 * and the application can't exists without the root.
	 *
	 * All components, even the root component, have a link to the root component.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `false`
	 *
	 * @example
	 * ```typescript
	 * @component({root: true})
	 * class pRoot extends iStaticPage {
	 *
	 * }
	 * ```
	 */
	root?: boolean;

	/**
	 * If false, then the component won't load an external template and will use the default loopback render function.
	 * It is useful for components without templates.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	tpl?: boolean;

	/**
	 * Functional mode:
	 *
	 * 1. if true, the component will be created as a functional component;
	 * 2. if a dictionary, the component can be created as a functional component or as a regular component, depending on
	 * values of the input properties:
	 *   1. if an empty dictionary, the component will always created as functional;
	 *   2. if a dictionary with values, the dictionary properties represent component input properties.
	 *      If the component invocation take these properties with the values that declared within "functional" parameters,
	 *      it will be created as functional.
	 *      Also, you can specify multiple values of one input property by using a list of values.
	 *      Mind that inferring of a component type is compile based, i.e. you can't depend on values from runtime,
	 *      but you can directly cast the type by using "v-func" directive;
	 *   3. if null, all components watchers and listeners that directly specified in a class don't
	 *      be attached to a functional component. It is useful to create superclass behaviour depending
	 *      on a component type.
	 *
	 * The functional component is a component that can be rendered only once from input properties.
	 * This type of components have a state and lifecycle hooks, but mutation of the state don't force re-render of a
	 * component. Usually, functional components lighter in 2-3 times with the first render than regular components, but
	 * avoid their if you have long animations within a component or if you need to frequent re-draws some deep structure
	 * of nested components.
	 *
	 * This parameter can be inherited from a parent, but the "null" value isn't inherited.
	 *
	 * @default `false`
	 *
	 * @example
	 * ```typescript
	 * // bButton will be created as a function component
	 * // if its .dataProvider property is equal to false, or not specified
	 * @component({functional: {dataProvider: [undefined, false]}})
	 * class bButton extends iData {
	 *
	 * }
	 *
	 * // bLink will be always created as a functional component
	 * @component({functional: true})
	 * class bLink extends iData {
	 *
	 * }
	 * ```
	 *
	 * ```
	 * // We force b-button to create as a regular component
	 * < b-button v-func = false
	 *
	 * // Within "v-func" we can use values from runtime
	 * < b-button v-func = foo !== bar
	 *
	 * // Direct invoking of a functional version of bButton
	 * < b-button-functional
	 * ```
	 */
	functional?: Nullable<boolean> | Dictionary;

	/**
	 * If true, then the component can be used as a flyweight component.
	 * The flyweight component is a special kind of a stateless component that borrows parent context
	 * to create own context. This type of components have the lightest first render initialising comparing with
	 * functional or regular components, but there are a lot of limitations:
	 *
	 * 1. you don't have a state;
	 * 2. you can't use lifecycle hooks;
	 * 3. you can't watch changes of component properties.
	 *
	 * Also, flyweight components inherit all limitation from functional components. But, you still have modifier API.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `false`
	 *
	 * @example
	 * ```typescript
	 * @component({flyweight: true}})
	 * class bButton extends iData {
	 *
	 * }
	 * ```
	 *
	 * ```
	 * // To use a component as flyweight you need to add @ symbol
	 * // before the component name within a template
	 * < @b-button
	 * ```
	 */
	flyweight?: boolean;

	/**
	 * Parameters to use "v-model" directive with a component.
	 *
	 * If the component can provide one logical value, you can use v-model directive
	 * to create kind of "two-way" binding.
	 *
	 * This parameter can be inherited from a parent.
	 *
	 * @example
	 * ```typescript
	 * @component({model: {prop: 'valueProp', event: 'onValueChange'}})
	 * class bInput extends iData {
	 *   @prop()
	 *   valueProp: string = '';
	 *
	 *   @field((ctx) => ctx.sync.link())
	 *   value!: string;
	 *
	 *   @watch('value')
	 *   onValueChange(): void {
	 *     this.emit('valueChange', this.value);
	 *   }
	 * }
	 * ```
	 *
	 * ```
	 * // The value of bInput is two-way binded to bla
	 * < b-input v-model = bla
	 * ```
	 */
	model?: ComponentModel;

	/**
	 * Map of deprecated props with specified alternatives.
	 * Dictionary keys represent deprecated props; values represent alternatives.
	 * This parameter can be inherited from a parent.
	 *
	 * @example
	 * ```typescript
	 * @component({deprecatedProps: {
	 *   value: 'items'
	 * }}}})
	 *
	 * class bList extends iData {
	 *   @prop()
	 *   items: string[];
	 *
	 *   // @deprecated
	 *   @prop()
	 *   value: string[];
	 * }
	 * ```
	 */
	deprecatedProps?: Dictionary<string>;

	/**
	 * If true, then component input properties that isn't registered as props
	 * will be attached to a component node as attributes.
	 *
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class bInput extends iData {
	 *   @prop()
	 *   value: string = '';
	 * }
	 * ```
	 *
	 * ```
	 * < b-input :data-title = 'hello'
	 * ```
	 */
	inheritAttrs?: boolean;

	/**
	 * If true, then a component is automatically inherited base modifiers from its parent.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	inheritMods?: boolean;

	/**
	 * If false, then all default values of component input properties are ignored
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	defaultProps?: boolean;
}

/**
 * Component model declaration
 */
export interface ComponentModel {
	/**
	 * Prop name that tied with the model
	 */
	prop?: string;

	/**
	 * Event name that tied with the model
	 */
	event?: string;
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

export type ComponentWatchDependencies = Map<WatchPath, WatchPath[]>;
