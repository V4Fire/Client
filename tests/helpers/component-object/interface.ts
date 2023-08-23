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
