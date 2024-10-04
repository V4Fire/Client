/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIData } from 'components/dummies/b-dummy/b-dummy';

import type bFriendsDaemonsDummy from 'components/friends/daemons/test/b-friends-daemons-dummy/b-friends-daemons-dummy';

export interface UnsafeBFriendsDaemonsDummy<
	CTX extends bFriendsDaemonsDummy = bFriendsDaemonsDummy
	// @ts-ignore (override)
> extends UnsafeIData<CTX> {
	daemons: CTX['daemons'];
}
