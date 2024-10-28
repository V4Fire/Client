/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component, ModsDict } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
class bFriendsProvideDummy extends bDummy {
	override get sharedMods(): CanNull<ModsDict> {
		return {foo: 'bar'};
	}
}

export default bFriendsProvideDummy;
