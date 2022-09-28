/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'friends/friend';
import iBlock from 'super/i-block/i-block';

import type * as router from 'super/i-block/modules/state/router';
import type * as storage from 'super/i-block/modules/state/storage';
import type * as helpers from 'super/i-block/modules/state/helpers';

let
	baseSyncRouterState;

interface State {
	saveToRouter: typeof router.saveToRouter;
	initFromRouter: typeof router.initFromRouter;
	resetRouter: typeof router.resetRouter;

	saveToStorage: typeof storage.saveToStorage;
	initFromStorage: typeof storage.initFromStorage;
	resetStorage: typeof storage.resetStorage;

	set: typeof helpers.set;
}

@fakeMethods(
	'saveToRouter',
	'initFromRouter',
	'resetRouter',

	'saveToStorage',
	'initFromStorage',
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
