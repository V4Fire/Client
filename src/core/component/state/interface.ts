/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ExperimentsSet } from 'core/abt';

export interface State {
	isAuth?: boolean;
	isOnline?: boolean;
	lastOnlineDate?: Date;
	experiments?: ExperimentsSet;
}
