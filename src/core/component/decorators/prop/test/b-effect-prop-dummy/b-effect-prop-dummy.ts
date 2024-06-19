/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, prop, field, computed } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bEffectPropDummy extends bDummy {
	@prop(Object)
	readonly dataProp?: object;

	@field((o) => o.sync.link<Dictionary>((v) => ({...v})))
	data?: object;

	@computed({dependencies: ['data']})
	get dataGetter(): CanUndef<object> {
		return this.data;
	}
}
