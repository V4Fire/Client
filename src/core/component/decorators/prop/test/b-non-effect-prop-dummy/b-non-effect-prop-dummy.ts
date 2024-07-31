/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, prop, system, computed, watch } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bNonEffectPropDummy extends bDummy {
	@prop({type: Object, forceUpdate: false, required: false})
	readonly dataProp?: object;

	@prop({default: () => 42, type: Number, validator: Number.isPositive, forceUpdate: false})
	readonly propWithDefault?: number;

	@system((o) => o.sync.link<Dictionary>((v) => ({...v})))
	data?: object;

	@computed({dependencies: ['data']})
	get dataGetter(): CanUndef<object> {
		return this.data;
	}

	@watch('data')
	onDataChange(value: object, oldValue: object): void {
		this.console.log(this.componentId, 'data has changed', 'new', value, 'old', oldValue);
	}
}
