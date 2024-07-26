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

import { components } from 'core/component/const';
import type { VNode } from 'core/component/engines';

import type iBlock from 'components/super/i-block/i-block';
import iData, { component, field, computed } from 'components/super/i-data/i-data';

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

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
	};

	/**
	 * Returns normalized attributes for the test component
	 */
	@computed({dependencies: ['testComponentAttrs']})
	protected get testComponentAttrsNormalized(): Dictionary {
		const meta = components.get(this.testComponent ?? '');

		if (meta == null) {
			return this.testComponentAttrs;
		}

		// Creating new object to prevent mutation of the field
		const attrs = {};

		Object.keys(this.testComponentAttrs).forEach((key) => {
			const value = this.testComponentAttrs[key];

			if (meta.props[key]?.forceUpdate === false) {
				attrs[`@:${key}`] = this.createPropAccessors(() => <object>value);

			} else {
				attrs[key] = value;
			}
		});

		return attrs;
	}
}
