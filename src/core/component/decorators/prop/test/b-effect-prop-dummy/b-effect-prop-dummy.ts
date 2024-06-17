/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, prop, system } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component({
	functional: {
		functional: true
	}
})

export default class bEffectPropDummy extends bDummy {
	@prop()
	dataProp?: string;

	@system((o) => o.sync.link())
	data?: string;
}
