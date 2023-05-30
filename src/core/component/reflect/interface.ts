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
 * Information of a component that can be taken from it constructor
 */
export interface ComponentConstructorInfo {
	/**
	 * Full name of the component.
	 * If the component is smart, the name can contain a `-functional` postfix.
	 */
	name: string;

	/**
	 * Component name without special postfixes
	 */
	componentName: string;

	/**
	 * True if the component is abstract.
	 * That is, it has an abstract `i` prefix in its name.
	 */
	isAbstract: boolean;

	/**
	 * True if the component is smart.
	 * That is, it compiles as a functional component and as a regular component.
	 */
	isSmart: boolean;

	/**
	 * A link to the component constructor
	 */
	constructor: ComponentConstructor;

	/**
	 * A dictionary with the component parameters that were provided to the `@component` decorator
	 */
	params: ComponentOptions;

	/**
	 * A link to the parent component constructor
	 */
	parent?: Function;

	/**
	 * A dictionary with the parent component parameters that were provided to the `@component` decorator
	 */
	parentParams?: ComponentOptions;

	/**
	 * A link to the parent component meta object
	 */
	parentMeta?: ComponentMeta;
}

/**
 * Available types of a property accessor:
 *
 * 1. `computed` - the cached type;
 * 2. `accessor` - the non-cached type.
 */
export type AccessorType =
	'computed' |
	'accessor';

/**
 * Available types of own component properties
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
	 * Top property name relative to a component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // name == 'bla'
	 * ```
	 */
	name: string;

	/**
	 * Normalized property path relative to a component that owns the property
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
	 * Normalized path to a top property relative a component that owns the property
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
	 * The original path to a top property from a component that owns the property
	 *
	 * @example
	 * ```js
	 * getPropertyInfo('$root.bla.bar', ctx) // originalPath == '$root.bla'
	 * ```
	 */
	originalTopPath: string;

	/**
	 * An accessor name that is tied with the property
	 */
	accessor?: string;

	/**
	 * An accessor type that is tied with the property
	 */
	accessorType?: AccessorType;
}

/**
 * Information of a regular component property: `prop`, `field`, `computedField`, etc.
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
 * Information of a mounted component property.
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
