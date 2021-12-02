/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-module-loader/README.md]]
 * @packageDocumentation
 */

import iData, { component, prop, Module } from '@src/super/i-data/i-data';

export * from '@src/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyModuleLoader extends iData {
	@prop({
		default: () => globalThis.loadFromProp === true ?
			[
				{
					id: 'b-dummy-module1',
					load: () => import('@src/dummies/b-dummy-module-loader/b-dummy-module1')
				},

				{
					id: 'b-dummy-module2',
					load: () => import('@src/dummies/b-dummy-module-loader/b-dummy-module2')
				}
			] :

			[]
	})

	override dependenciesProp!: Module[];
}
