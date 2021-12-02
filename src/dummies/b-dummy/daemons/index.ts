/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DaemonsDict } from '~/dummies/b-dummy/b-dummy';

export default <DaemonsDict>{
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
