import type { UnsafeIData } from 'components/dummies/b-dummy/b-dummy';

import type bFriendsDaemonsDummy from 'components/friends/daemons/test/b-friends-daemons-dummy/b-friends-daemons-dummy';

export interface UnsafeBFriendsDaemonsDummy<CTX extends bFriendsDaemonsDummy = bFriendsDaemonsDummy>
	extends UnsafeIData<CTX> {
	daemons: CTX['daemons'];
}
