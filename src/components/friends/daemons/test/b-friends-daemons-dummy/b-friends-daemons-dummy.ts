/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { UnsafeGetter, component } from 'components/dummies/b-dummy/b-dummy';

import Daemons, { DaemonsDict } from 'components/friends/daemons';
import * as DaemonsAPI from 'components/friends/daemons/api';

import type { UnsafeBFriendsDaemonsDummy } from 'components/friends/daemons/test/b-friends-daemons-dummy/interface';

export * from 'components/dummies/b-dummy/b-dummy';

Daemons.addToPrototype(DaemonsAPI);

interface bFriendsDaemonsDummy extends Dictionary {}

@component()
class bFriendsDaemonsDummy extends bDummy {
	override get unsafe(): UnsafeGetter<UnsafeBFriendsDaemonsDummy<this>> {
		return Object.cast(this);
	}

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
			fn(this: bFriendsDaemonsDummy, newValue: unknown, oldValue: unknown) {
				globalThis.daemonsTest = globalThis.daemonsTest ?? {};
				globalThis.daemonsTest.fieldUpdate = true;
				this.localEmitter.emit('change', [newValue, oldValue]);
			}
		},

		execOnFieldChangeImmediate: {
			immediate: true,
			watch: ['testFieldImmediate'],
			fn(this: bFriendsDaemonsDummy, newValue: unknown, oldValue: unknown) {
				this.localEmitter.emit('change', [newValue, oldValue]);
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
