/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, prop, field, ModsProp, ModsDict } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bSuperIBlockModsDummy extends bDummy {
	@prop({type: Object, required: false})
	readonly modsToProvide?: ModsProp;

	@field()
	checked: boolean = false;

	get providedMods(): ModsDict {
		return this.$refs.dummy.mods;
	}

	protected override readonly $refs!: bDummy['$refs'] & {
		dummy: bDummy;
	};
}
