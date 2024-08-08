/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options that can be passed while registering a component
 */
export interface ComponentOptions {
	/**
	 * The name of the component.
	 * If not specified, the name is obtained from the class name via reflection.
	 * This parameter cannot be inherited from the parent component.
	 *
	 * @example
	 * ```typescript
	 * // name == 'bExample'
	 * @component({name: 'bExample'})
	 * class Foo extends iBlock {
	 *
	 * }
	 *
	 * // name == 'bExample'
	 * @component()
	 * class bExample extends iBlock {
	 *
	 * }
	 * ```
	 */
	name?: string;

	partial?: string;

	/**
	 * If set to true, the component is registered as the root component.
	 * The root component sits at the top of the component hierarchy and contains all components in the application.
	 * By default, all components have a link to the root component.
	 * This parameter may be inherited from the parent component.
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
	 * If set to false, the component uses the default loopback render function instead of loading its own template.
	 * This is useful for components without templates and can be inherited from the parent component.
	 *
	 * @default `true`
	 */
	tpl?: boolean;

	/**
	 * The component functional mode determines whether the component should be created as a functional component.
	 * This parameter can be inherited from the parent component, but the null value is not inherited.
	 *
	 * There are several options available for this parameter:
	 *
	 * 1. If set to true, the component will be created as a functional component.
	 * 2. If set to a dictionary, the component can be created as a functional component or a regular component,
	 *    depending on the values of its props:
	 *
	 *    1. If an empty dictionary is passed, the component will always be created as a functional one.
	 *       However, you can still create it like a regular component using the `v-func` directive.
	 *
	 *       ```
	 *       < b-button v-func = false
	 *       ```
	 *
	 *    2. If a dictionary with values is passed, the dictionary properties represent component props.
	 *       If the component invocation takes these props with the values that were declared within
	 *       the functional dictionary, it will be created as a functional one.
	 *       The values themselves can be represented as any value that can be encoded in JSON.
	 *       Note that you can specify multiple values for the same prop using a list of values.
	 *       Keep in mind that component type inference is a compile-time operation,
	 *       meaning you cannot depend on values from the runtime.
	 *       If you need this feature, use the `v-for` directive.
	 *
	 *    3. If set to null, all components' watchers and listeners that are directly specified in the component class
	 *       won't be attached in the case of a functional component kind.
	 *       This is useful to create superclass behavior depending on a component type.
	 *
	 * A functional component is a component that can only be rendered once from input properties.
	 * Components of this type have state and lifecycle hooks, but changing the state does not cause re-render.
	 *
	 * Usually, functional components are lighter than regular components on the first render,
	 * but avoid them if you have long animations inside a component
	 * or if you need to frequently redraw some deep structure of nested components.
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
	 * // Explicit creation of a functional component by name
	 * < b-button-functional
	 * ```
	 */
	functional?: Nullable<boolean> | Dictionary<CanArray<JSONLikeValue>>;

	/**
	 * If set to false, all default values for the input properties of the component will be disregarded.
	 * This parameter may be inherited from the parent component.
	 *
	 * @default `true`
	 */
	defaultProps?: boolean;

	/**
	 * A dictionary that specifies deprecated component props along with their recommended alternatives.
	 * The keys in the dictionary represent the deprecated props,
	 * while the values represent their replacements or alternatives.
	 *
	 * @example
	 * ```typescript
	 * @component({deprecatedProps: {
	 *   value: 'items'
	 * }})
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
	 * If set to true, any component input properties not registered as props will be attached to
	 * the component node as attributes.
	 *
	 * This parameter may be inherited from the parent component.
	 *
	 * @default `true`
	 *
	 * @example
	 * ```typescript
	 * import iData, { component, prop } from 'components/super/i-data/i-data';
	 *
	 * @component()
	 * class bInput extends iData {
	 *   @prop()
	 *   value: string = '';
	 *
	 *   mounted() {
	 *     console.log(this.$attrs['data-title']);
	 *   }
	 * }
	 * ```
	 *
	 * ```
	 * < b-input :data-title = 'hello'
	 * ```
	 */
	inheritAttrs?: boolean;

	/**
	 * If set to true, the component will automatically inherit base modifiers from its parent component.
	 * This parameter may be inherited from the parent component.
	 *
	 * @default `true`
	 */
	inheritMods?: boolean;

	/**
	 * The name of the NPM package in which the component is defined or overridden
	 */
	layer?: string;
}
