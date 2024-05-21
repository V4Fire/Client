/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watchObj from 'core/object/watch';
import type { State } from 'core/component/state';

const watcher = watchObj<State>({
	isAuth: undefined,
	isOnline: undefined,
	lastOnlineDate: undefined,
	experiments: undefined,
	route: undefined,
	globalEnv: {}
});

export default watcher.proxy;

export const
	watch = watchObj.bind(null, watcher.proxy),
	set = watcher.set.bind(watcher),
	unset = watcher.delete.bind(watcher);
