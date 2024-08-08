/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	ComponentConstructor,
	ComponentInterface,
	ComponentOptions,
	ComponentMeta

} from 'core/component/interface';

/**
 * Information about a component that can be obtained from its constructor
 */
export interface ComponentConstructorInfo {
	/**
	 * The full name of the component, which may include a `-functional` postfix if the component is smart
	 */
	name: string;

	/**
	 * Component name without any special postfixes
	 */
	componentName: string;

	/**
	 * True if the component has an abstract prefix in its name,
	 * which means it is an interface or base class that cannot be instantiated directly but can be extended by
	 * other classes
	 */
	isAbstract: boolean;

	/**
	 * True if the component is "smart".
	 * That is, such a component can be created as functional or as regular, depending on its props.
	 */
	isSmart: boolean;

	/**
	 * A link to the component's constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * A dictionary that contains the parameters provided to the `@component` decorator for the component
	 */
	params: ComponentOptions;

	/**
	 * A link to the parent component's constructor
	 */
	parent: CanNull<Function>;

	/**
	 * A dictionary containing the parent component's parameters that were passed to the @component decorator
	 */
	parentParams: CanNull<ComponentOptions>;

	/**
	 * A link to the metaobject of the parent component
	 */
	parentMeta: CanNull<ComponentMeta>;

	/**
	 * The name of the NPM package in which the component is defined or overridden
	 */
	layer?: string;
}

/**
 * The available types of property accessors:
 *
 * 1. `computed` - the cached type;
 * 2. `accessor` - the non-cached type.
 */
export type AccessorType =
	'computed' |
	'accessor';

/**
 * The available types of component properties
 */
export type PropertyType =
	'prop' |
	'attr' |
	'field' |
	'system' |
	AccessorType;

/**
 * The common information of a component property
 */
export interface CommonPropertyInfo {
	/**
	 * The top property name relative to the component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // name == 'bla'
	 * ```
	 */
	name: string;

	/**
	 * Normalized property path relative to the component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // path == 'bla.bar'
	 * ```
	 */
	path: string;

	/**
	 * Normalized full path to the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // fullPath == '$root.bla.bar'
	 * ```
	 */
	fullPath: string;

	/**
	 * Normalized path to the top property relative the component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // fullPath == '$root.bla'
	 * ```
	 */
	topPath: string;

	/**
	 * The original path to the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // originalPath == '$root.bla.bar'
	 * ```
	 */
	originalPath: string;

	/**
	 * The original path to the top property from the component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // originalPath == '$root.bla'
	 * ```
	 */
	originalTopPath: string;

	/**
	 * An accessor name that is associated with the specific property
	 */
	accessor?: string;

	/**
	 * An accessor type that is associated with the specific property
	 */
	accessorType?: AccessorType;
}

/**
 * The information of a regular component property: `prop`, `field`, `computedField`, etc.
 */
export interface ComponentPropertyInfo extends CommonPropertyInfo {
	/**
	 * The property type
	 */
	type: PropertyType;

	/**
	 * A link to the component that owns this property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // ctx == $root
	 * ```
	 */
	ctx: ComponentInterface;
}

/**
 * The information of a mounted component property.
 * The mounted properties are a special kind of component properties that refer to other watchable objects.
 */
export interface MountedPropertyInfo extends CommonPropertyInfo {
	/**
	 * The property type
	 */
	type: 'mounted';

	/**
	 * A link to the raw watchable object that mounted to the property
	 */
	ctx: object;
}

export type PropertyInfo = ComponentPropertyInfo | MountedPropertyInfo;
