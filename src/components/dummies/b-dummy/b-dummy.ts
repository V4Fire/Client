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
import iData, { component, field, system } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

@component({
	functional: {
		functional: true
	}
})

export default class bDummy extends iData {
	/**
	 * The name of the test component
	 */
	@field()
	testComponent?: string;

	/**
	 * Attributes of the test component
	 */
	@field()
	testComponentAttrs: Dictionary = {};

	/**
	 * Slots of the test component
	 */
	@field()
	testComponentSlots?: CanArray<VNode>;

	/**
	 * The number that shows how many times the component's render function was called
	 */
	@system()
	renderCounter: number = 0;

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
	};

	/**
	 * Increases the value of `renderCounter` by 1
	 */
	protected incRenderCounter(): void {
		this.renderCounter++;
	}
}
