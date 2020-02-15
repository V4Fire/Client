/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentParams, ComponentMeta } from 'core/component/interface';

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
	constructor: Function;

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
