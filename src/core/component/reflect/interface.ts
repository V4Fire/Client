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
 * Information of a component that can be taken from a constructor
 */
export interface ComponentConstructorInfo {
	/**
	 * The full component name.
	 * If the component is smart the name can contain a `-functional` postfix.
	 */
	name: string;

	/**
	 * Name of the component without special postfixes
	 */
	componentName: string;

	/**
	 * True if the component is abstract, i.e., has an abstract `i` prefix within the name
	 */
	isAbstract: boolean;

	/**
	 * True if the component is smart, i.e., it is compiled as a functional component and as regular component
	 */
	isSmart: boolean;

	/**
	 * Link to the component constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * Map of component parameters that were provided to a `@component` decorator
	 */
	params: ComponentOptions;

	/**
	 * Link to a parent constructor
	 */
	parent?: Function;

	/**
	 * Map of parent component parameters that were provided to a `@component` decorator
	 */
	parentParams?: ComponentOptions;

	/**
	 * Link to a parent component meta object
	 */
	parentMeta?: ComponentMeta;
}

/**
 * Available types of a property accessor:
 *
 * 1. computed - the cached type;
 * 2. accessor - the non-cached type.
 */
export type AccessorType =
	'computed' |
	'accessor';

/**
 * Available types of an own component properties
 */
export type PropertyType =
	'prop' |
	'attr' |
	'field' |
	'system' |
	AccessorType;

/**
 * Common information of a component property
 */
export interface CommonPropertyInfo {
	/**
	 * The top property name from a component
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // name == 'bla'
	 * ```
	 */
	name: string;

	/**
	 * Normalized property path relative the component that owns this property
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
	 * Normalized path to the top property from a component
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // fullPath == '$root.bla'
	 * ```
	 */
	topPath: string;

	/**
	 * Original path to the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // originalPath == '$root.bla.bar'
	 * ```
	 */
	originalPath: string;

	/**
	 * Original path to the top property from a component
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // originalPath == '$root.bla'
	 * ```
	 */
	originalTopPath: string;

	/**
	 * Name of accessor that is tied with the property
	 */
	accessor?: string;

	/**
	 * Type of accessor that is tied with the property
	 */
	accessorType?: AccessorType;
}

/**
 * Information of a regular component property: prop, field, computedField, etc.
 */
export interface ComponentPropertyInfo extends CommonPropertyInfo {
	/**
	 * Property type
	 */
	type: PropertyType;

	/**
	 * Link to a context of the property: the component that owns this property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // ctx == $root
	 * ```
	 */
	ctx: ComponentInterface;
}

/**
 * Information of a mounted component property.
 * The mounted property it's the special kind of component property that refers to another watchable object.
 */
export interface MountedPropertyInfo extends CommonPropertyInfo {
	/**
	 * Property type
	 */
	type: 'mounted';

	/**
	 * Link to a context of the property: the raw watchable object that mounted to the property
	 */
	ctx: object;
}

export type PropertyInfo = ComponentPropertyInfo | MountedPropertyInfo;
