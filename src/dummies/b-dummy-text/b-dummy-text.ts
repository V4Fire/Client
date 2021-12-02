/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-text/README.md]]
 * @packageDocumentation
 */

import iInputText, { component } from '~/super/i-input-text/i-input-text';

export * from '~/super/i-input-text/i-input-text';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyText extends iInputText {

}
