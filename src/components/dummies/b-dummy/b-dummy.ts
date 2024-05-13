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

import type { VNode } from 'core/component/engines';

import type iBlock from 'components/super/i-block/i-block';
import iData, { prop, component, field, system } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

@component({
	functional: {
		functional: true
	}
})

class bDummy extends iData {
	@prop()
	pageProp?: string;

	@system((o) => o.sync.link())
	page?: string;

	/**
	 * Name of the test component
	 */
	@field()
	testComponent?: string;

	/**
	 * Attributes for the test component
	 */
	@field()
	testComponentAttrs: Dictionary = {};

	/**
	 * Slots for the test component
	 */
	@field()
	testComponentSlots?: CanArray<VNode>;

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
	};
}

export default bDummy;
