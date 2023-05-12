/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, Module } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bFriendsModuleLoaderDummy extends iData {
	@prop({
		default: () => globalThis.loadFromProp === true ?
			[
				{
					id: 'b-friends-module-loader-dummy1',
					load: () => import('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1')
				},

				{
					id: 'b-friends-module-loader-dummy2',
					load: () => import('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy2')
				}
			] :

			[]
	})

	override dependenciesProp!: Module[];
}
