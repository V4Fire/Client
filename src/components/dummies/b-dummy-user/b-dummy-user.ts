/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/dummies/b-dummy/README.md]]
 * @packageDocumentation
 */

import { field } from 'core/component';
import iData, { component, prop, hook } from 'components/super/i-data/i-data';
import type { DummyUser } from 'components/dummies/b-dummy-user/interface';

export * from 'components/super/i-data/i-data';

@component()
class bDummyUser extends iData {
	@field()
	dummyTestVal: number = 1;

	@prop()
	dummyData!: DummyUser;

	@hook('beforeDestroy')
	protected onBeforeDestroy() {
		this.console.log('before destroy');
	}
}

export default bDummyUser;
