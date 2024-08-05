/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, field } from 'components/dummies/b-dummy/b-dummy';
import type bNonEffectPropDummy from 'core/component/decorators/prop/test/b-non-effect-prop-dummy/b-non-effect-prop-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bEffectPropWrapperDummy extends bDummy {
	@field()
	someField: {a?: number; b?: {c: number}} = {};

	@field()
	requestField: {get: {chunkSize: number}} = {get: {chunkSize: 10}};

	get child(): bNonEffectPropDummy {
		return this.$refs.child;
	}

	protected override readonly $refs!: bDummy['$refs'] & {
		child: bNonEffectPropDummy;
	};
}
