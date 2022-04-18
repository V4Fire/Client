/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options to register a component
 */
export interface ComponentOptions {
	/**
	 * The component name.
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
	 * The root component is the top of components hierarchy, i.e. it contains all components in an application.
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
	 * If false, then the component won't load an external template.
	 * It will use the default loopback render function.
	 *
	 * It is useful for components without templates.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	tpl?: boolean;

	/**
	 * The functional mode:
	 *
	 * 1. If true, the component will be created as a functional component.
	 * 2. If a dictionary, the component can be created as a functional component or regular component, depending on
	 * values of the input properties:
	 *   1. If an empty dictionary, the component will always created as functional.
	 *   2. If a dictionary with values, the dictionary properties represent component input properties.
	 *      If the component invocation takes these properties with the values that
	 *      declared within "functional" parameters, it will be created as a functional.
	 *      Also, you can specify multiple values of one input property by using a list of values.
	 *      Mind that inferring of a component type is compile-based, i.e. you can't depend on values from the runtime,
	 *      but you can directly cast a type by using "v-func" directive.
	 *   3. If null, all components watchers and listeners that directly specified in a class won't
	 *      be attached to a functional component. It is useful to create superclass behaviour depending
	 *      on a component type.
	 *
	 * A functional component is a component can be rendered once only from input properties.
	 * This type of components have a state and lifecycle hooks, but mutation of the state doesn't force rendering.
	 * Usually, functional components lighter than regular components with the first render,
	 * but avoid their if you have long animations within a component or if you need to frequent re-draws some deep
	 * structure of nested components.
	 *
	 * This parameter can be inherited from a parent, but the `null` value isn't inherited.
	 *
	 * @default `false`
	 *
	 * @example
	 * ```typescript
	 * // `bButton` will be created as a function component
	 * // if its `dataProvider` property is equal to `false` or not specified
	 * @component({functional: {dataProvider: [undefined, false]}})
	 * class bButton extends iData {
	 *
	 * }
	 *
	 * // `bLink` will always be created as a functional component
	 * @component({functional: true})
	 * class bLink extends iData {
	 *
	 * }
	 * ```
	 *
	 * ```
	 * // We force `b-button` to create as a regular component
	 * < b-button v-func = false
	 *
	 * // Within `v-func` we can use values from the runtime
	 * < b-button v-func = foo !== bar
	 *
	 * // The direct invoking of a functional version of `bButton`
	 * < b-button-functional
	 * ```
	 */
	functional?: Nullable<boolean> | Dictionary;

	/**
	 * A map of deprecated props with specified alternatives.
	 * The map keys represent deprecated props; the values represent alternatives.
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
	 * If true, then the component input properties that aren't registered as props
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
	 * If true, then the component is automatically inherited base modifiers from its parent.
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	inheritMods?: boolean;

	/**
	 * If false, then all default values of the component input properties are ignored
	 * This parameter can be inherited from a parent.
	 *
	 * @default `true`
	 */
	defaultProps?: boolean;
}
