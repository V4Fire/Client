/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Experiments } from 'core/abt';

export interface State {
	/**
	 * Is session is authorized
	 */
	isAuth?: boolean;

	/**
	 * Is there an Internet connection
	 */
	isOnline?: boolean;

	/**
	 * Date of last Internet connection
	 */
	lastOnlineDate?: Date;

	/**
	 * A list of registered AB experiments
	 */
	experiments?: Experiments;
}
