/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import iBlock from 'components/super/i-block/i-block';

import type * as api from 'components/friends/state/api';

let
	baseSyncRouterState;

interface State {
	saveToRouter: typeof api.saveToRouter;
	initFromRouter: typeof api.initFromRouter;
	resetRouter: typeof api.resetRouter;

	saveToStorage: typeof api.saveToStorage;
	initFromStorage: typeof api.initFromStorage;
	resetStorage: typeof api.resetStorage;

	set: typeof api.set;
}

@fakeMethods(
	'initFromRouter',
	'saveToRouter',
	'resetRouter',

	'initFromStorage',
	'saveToStorage',
	'resetStorage',

	'set'
)

class State extends Friend {
	/**
	 * True if synchronization with the router is needed
	 */
	get needRouterSync(): boolean {
		// @ts-ignore (access)
		// eslint-disable-next-line @typescript-eslint/unbound-method
		baseSyncRouterState ??= iBlock.prototype.syncRouterState;
		return baseSyncRouterState !== this.instance.syncRouterState;
	}

	/** @see [[iBlock.instance]] */
	protected get instance(): this['CTX']['instance'] {
		return this.ctx.instance;
	}
}

export default State;
