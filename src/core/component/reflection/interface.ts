/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentParams, ComponentMeta, ComponentInterface, ComponentConstructor } from 'core/component/interface';

/**
 * Information about a component that can be taken from a constructor
 */
export interface ComponentConstructorInfo {
	/**
	 * Full name of a component.
	 * If the component is smart the name can be equal to `b-foo-functional`.
	 */
	name: string;

	/**
	 * Name of the component without special postfixes
	 */
	componentName: string;

	/**
	 * True if the component is abstract, i.e. has a special prefix in the name
	 */
	isAbstract: boolean;

	/**
	 * True if the component is smart, i.e. it is compiled as a functional component and as a regular component
	 */
	isSmart: boolean;

	/**
	 * Link to the component constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * Map of component parameters that was provided to a @component decorator
	 */
	params: ComponentParams;

	/**
	 * Link to a parent constructor
	 */
	parent?: Function;

	/**
	 * Map of parent component parameters that was provided to a @component decorator
	 */
	parentParams?: ComponentParams;

	/**
	 * Link to a parent component meta object
	 */
	parentMeta?: ComponentMeta;
}

export type AccessorType =
	'computed' |
	'accessor';

export type PropertyType =
	'prop' |
	'field' |
	'system' |
	AccessorType;

/**
 * Information about a component property: prop, field, computed, etc.
 */
export interface PropertyInfo {
	/**
	 * Property root name
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // name == 'bla'
	 * ```
	 */
	name: string;

	/**
	 * Path to the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // path == 'bla.bar'
	 * ```
	 */
	path: string;

	/**
	 * Full path to the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // fullPath == '$root.bla.bar'
	 * ```
	 */
	fullPath: string;

	/**
	 * Property type
	 */
	type: PropertyType;

	/**
	 * Name of an accessor that is tied with the property
	 */
	accessor?: string;

	/**
	 * Type of an accessor that is tied with the property
	 */
	accessorType?: AccessorType;

	/**
	 * Link to a context of the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // ctx == $root
	 * ```
	 */
	ctx: ComponentInterface;
}
