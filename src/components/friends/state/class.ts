/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import iBlock from 'components/super/i-block/i-block';

let
	baseSyncRouterState;

interface State {
	saveToRouter(data?: Dictionary): Promise<boolean>;
	initFromRouter(): boolean;
	resetRouter(): Promise<boolean>;

	saveToStorage(data?: Dictionary): Promise<boolean>;
	initFromStorage(): CanPromise<boolean>;
	resetStorage(): Promise<boolean>;

	set(data: Nullable<Dictionary>): Array<Promise<unknown>>;
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
		baseSyncRouterState ??= iBlock.prototype.syncRouterState;
		return baseSyncRouterState !== Object.cast<typeof this.instance['unsafe']>(this.instance).syncRouterState;
	}

	/** {@link iBlock.instance} */
	protected get instance(): this['CTX']['instance'] {
		return this.ctx.instance;
	}
}

export default State;
