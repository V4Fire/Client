/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iData from 'components/super/i-data/i-data';

/**
 * Options for configuring a spy.
 */
export interface SpyOptions {
	/**
	 * If set to true, the spy will be installed on the prototype of the component class.
	 *
	 * Setting this option is useful for methods such as {@link iData.initLoad} because they
	 * are called not from an instance of the component, but using the `call` method from the class prototype.
	 */
	proto?: boolean;
}

/**
 * Options for the `build` method.
 */
export interface BuildOptions {
	/**
	 * If `true`, the component will be created inside a `b-dummy`, and its props will be set
	 * through the `field` property of `b-dummy`.
	 *
	 * Building the component with this option allows updating the component's props using the `updateProps` method.
	 *
	 * Using this option does not allow creating child nodes!!!
	 */
	useDummy?: boolean;

	/**
	 * If true, a functional version of the component will be created.
	 * The functional version is achieved by adding a -functional suffix to the component name during its creation.
	 */
	functional?: boolean;
}
