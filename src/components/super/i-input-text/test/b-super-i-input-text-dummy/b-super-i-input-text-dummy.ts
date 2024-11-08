/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInputText, { component } from 'components/super/i-input-text/i-input-text';

import Mask, * as MaskAPI from 'components/super/i-input-text/mask';

export * from 'components/super/i-input-text/i-input-text';

Mask.addToPrototype(MaskAPI);

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bSuperIInputTextDummy extends iInputText {

}
