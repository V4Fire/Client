/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-module-loader/b-dummy-module1/README.md]]
 * @packageDocumentation
 */

import iData, { component } from '@src/super/i-data/i-data';

export * from '@src/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyModule1 extends iData {

}
