/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

import type { DaemonsDict } from 'components/friends/daemons/interface';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
class bFriendsDaemonsDummy extends bDummy {
	static override readonly daemons: DaemonsDict = {
		execOnCreated: {
			hook: ['created'],
			fn: () => {
				globalThis.daemonsTest = globalThis.daemonsTest ?? {};
				globalThis.daemonsTest.created = true;
			}
		},

		execOnMounted: {
			hook: ['mounted'],
			fn: () => {
				globalThis.daemonsTest = globalThis.daemonsTest ?? {};
				globalThis.daemonsTest.mounted = true;
			}
		},

		execOnFieldChange: {
			watch: ['testField'],
			fn: () => {
				globalThis.daemonsTest = globalThis.daemonsTest ?? {};
				globalThis.daemonsTest.fieldUpdate = true;
			}
		},

		executable: {
			fn: () => {
				globalThis.daemonsTest = globalThis.daemonsTest ?? {};
				globalThis.daemonsTest.executable = true;
			}
		}
	};
}

export default bFriendsDaemonsDummy;
