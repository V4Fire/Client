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
	 * True, if the current user session is authorized
	 */
	isAuth?: boolean;

	/**
	 * True, if the application is connected to the Internet
	 */
	isOnline?: boolean;

	/**
	 * Date of the last Internet connection
	 */
	lastOnlineDate?: Date;

	/**
	 * A list of registered AB experiments
	 */
	experiments?: Experiments;
}
